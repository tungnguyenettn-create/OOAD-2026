"""Các endpoint P0 bổ sung cho bản refactor.

Gồm:
- bệnh nhân tự cập nhật hồ sơ và đổi mật khẩu;
- bác sĩ/admin kê đơn thuốc;
- bệnh nhân/bác sĩ thêm chỉ số sức khoẻ;
- bác sĩ/admin tải tài liệu PDF lên hồ sơ bệnh án.

Tách khỏi main.py để giữ entrypoint gọn, nhưng vẫn dùng chung URL cũ.
"""

import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from auth import get_current_user, hash_password, verify_password
from database import get_db
from models import (
    Doctor,
    DoctorPatient,
    HealthMetric,
    MedicalDocument,
    MedicalRecord,
    Patient,
    PatientAccount,
    Prescription,
    User,
)

router = APIRouter(tags=["Patient features"])

ALLOWED_GENDERS = {"Male", "Female", "Other"}
ALLOWED_METRIC_TYPES = {
    "Height",
    "Weight",
    "BloodPressure",
    "HeartRate",
    "Temperature",
    "BloodGlucose",
    "SpO2",
    "Other",
}
ALLOWED_DOCUMENT_TYPES = {
    "Examination",
    "LabResult",
    "Prescription",
    "Other",
}
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024
STORAGE_ROOT = Path(__file__).resolve().parent / "medical_files"


class PatientSelfUpdate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = Field(default=None, max_length=255)


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class PrescriptionCreate(BaseModel):
    medical_record_id: int
    medication_name: str = Field(min_length=1, max_length=255)
    dosage: Optional[str] = Field(default=None, max_length=100)
    frequency: Optional[str] = Field(default=None, max_length=100)
    duration: Optional[str] = Field(default=None, max_length=100)
    instructions: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("medication_name")
    @classmethod
    def validate_medication_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Medication name cannot be blank")
        return value


class HealthMetricCreate(BaseModel):
    metric_type: str
    value: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=30)
    secondary_value: Optional[float] = Field(default=None, gt=0)
    measured_at: Optional[datetime] = None
    source: Optional[str] = Field(default=None, max_length=100)
    patient_id: Optional[int] = None
    medical_record_id: Optional[int] = None


def _patient_account(db: Session, user: User) -> Optional[PatientAccount]:
    return (
        db.query(PatientAccount)
        .filter(PatientAccount.user_id == user.id)
        .first()
    )


def _doctor_profile(db: Session, user: User) -> Optional[Doctor]:
    return db.query(Doctor).filter(Doctor.user_id == user.id).first()


def _doctor_can_edit_record(
    db: Session,
    doctor: Doctor,
    record: MedicalRecord,
) -> bool:
    """Bác sĩ được thao tác trên hồ sơ do mình lập hoặc của bệnh nhân được phân công."""
    if record.doctor_id == doctor.id:
        return True

    assignment = (
        db.query(DoctorPatient)
        .filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.patient_id == record.patient_id,
        )
        .first()
    )

    return assignment is not None


def _record_or_404(db: Session, record_id: int) -> MedicalRecord:
    record = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.id == record_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Medical record not found",
        )

    return record


def _metric_dict(metric: HealthMetric) -> dict:
    return {
        "id": metric.id,
        "patient_id": metric.patient_id,
        "medical_record_id": metric.medical_record_id,
        "metric_type": metric.metric_type,
        "value": float(metric.value),
        "unit": metric.unit,
        "secondary_value": (
            float(metric.secondary_value)
            if metric.secondary_value is not None
            else None
        ),
        "measured_at": metric.measured_at,
        "source": metric.source,
    }


def _document_dict(document: MedicalDocument) -> dict:
    return {
        "id": document.id,
        "medical_record_id": document.medical_record_id,
        "document_type": document.document_type,
        "file_name": document.file_name,
        "mime_type": document.mime_type,
        "file_size": document.file_size,
        "created_at": document.created_at,
    }


@router.patch("/api/patients/{patient_id}")
def update_my_patient_profile(
    patient_id: int,
    data: PatientSelfUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bệnh nhân tự cập nhật hồ sơ của mình.

    Chỉ cho phép sửa thông tin hành chính, không đổi mã bệnh nhân/trạng thái.
    """

    if current_user.role != "patient":
        raise HTTPException(
            status_code=403,
            detail="Only patients can update their own profile",
        )

    account = _patient_account(db, current_user)

    if not account or account.patient_id != patient_id:
        raise HTTPException(
            status_code=403,
            detail="You can only update your own profile",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if data.gender is not None and data.gender not in ALLOWED_GENDERS:
        raise HTTPException(status_code=422, detail="Invalid gender")

    try:
        patient.full_name = data.full_name.strip()
        patient.date_of_birth = data.date_of_birth
        patient.gender = data.gender
        patient.phone = data.phone
        patient.email = data.email
        patient.address = data.address

        db.commit()
        db.refresh(patient)

        return {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "full_name": patient.full_name,
            "date_of_birth": patient.date_of_birth,
            "gender": patient.gender,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "status": patient.status,
        }

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile",
        ) from exc


@router.post("/api/me/password")
def change_my_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect",
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=422,
            detail="New password must be different from the current password",
        )

    current_user.password_hash = hash_password(data.new_password)

    try:
        db.commit()
        return {"message": "Password changed successfully"}
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to change password",
        ) from exc


@router.post("/api/prescriptions", status_code=201)
def create_prescription(
    data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = _record_or_404(db, data.medical_record_id)

    if current_user.role == "doctor":
        doctor = _doctor_profile(db, current_user)

        if not doctor:
            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found",
            )

        if not _doctor_can_edit_record(db, doctor, record):
            raise HTTPException(
                status_code=403,
                detail="You can only add prescriptions to your own or assigned patients' records",
            )

    elif current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to create prescriptions",
        )

    prescription = Prescription(**data.model_dump())
    db.add(prescription)

    try:
        db.commit()
        db.refresh(prescription)

        return {
            "message": "Prescription created successfully",
            "id": prescription.id,
            "medical_record_id": prescription.medical_record_id,
            "medication_name": prescription.medication_name,
            "dosage": prescription.dosage,
            "frequency": prescription.frequency,
            "duration": prescription.duration,
            "instructions": prescription.instructions,
            "created_at": prescription.created_at,
        }

    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create prescription",
        ) from exc


@router.delete("/api/prescriptions/{prescription_id}")
def delete_prescription(
    prescription_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prescription = (
        db.query(Prescription)
        .filter(Prescription.id == prescription_id)
        .first()
    )

    if not prescription:
        raise HTTPException(
            status_code=404,
            detail="Prescription not found",
        )

    if current_user.role == "doctor":
        doctor = _doctor_profile(db, current_user)

        if not doctor:
            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found",
            )

        record = _record_or_404(db, prescription.medical_record_id)

        if not _doctor_can_edit_record(db, doctor, record):
            raise HTTPException(
                status_code=403,
                detail="You can only delete prescriptions of your own or assigned patients' records",
            )

    elif current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to delete prescriptions",
        )

    try:
        db.delete(prescription)
        db.commit()
        return {
            "message": "Prescription deleted successfully",
            "id": prescription_id,
        }
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete prescription",
        ) from exc


@router.post("/api/health-metrics", status_code=201)
def create_health_metric(
    data: HealthMetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.metric_type not in ALLOWED_METRIC_TYPES:
        raise HTTPException(status_code=422, detail="Invalid metric type")

    if (
        data.secondary_value is not None
        and data.metric_type != "BloodPressure"
    ):
        raise HTTPException(
            status_code=422,
            detail="secondary_value is only valid for BloodPressure",
        )

    if current_user.role == "patient":
        account = _patient_account(db, current_user)

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Patient profile not found",
            )

        patient_id = account.patient_id

        if data.patient_id is not None and data.patient_id != patient_id:
            raise HTTPException(
                status_code=403,
                detail="You can only add metrics to your own profile",
            )

    elif current_user.role == "doctor":
        if data.patient_id is None:
            raise HTTPException(status_code=422, detail="patient_id is required")

        doctor = _doctor_profile(db, current_user)

        if not doctor:
            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found",
            )

        assignment = (
            db.query(DoctorPatient)
            .filter(
                DoctorPatient.doctor_id == doctor.id,
                DoctorPatient.patient_id == data.patient_id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(
                status_code=403,
                detail="You can only add metrics for patients assigned to you",
            )

        patient_id = data.patient_id

    elif current_user.role == "admin":
        if data.patient_id is None:
            raise HTTPException(status_code=422, detail="patient_id is required")

        patient_id = data.patient_id

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to add health metrics",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if data.medical_record_id is not None:
        record = _record_or_404(db, data.medical_record_id)

        if record.patient_id != patient_id:
            raise HTTPException(
                status_code=422,
                detail="Medical record does not belong to this patient",
            )

    measured_at = data.measured_at

    if measured_at is None:
        measured_at = datetime.now()
    else:
        if measured_at.tzinfo is not None:
            measured_at = measured_at.astimezone().replace(tzinfo=None)

        if measured_at > datetime.now() + timedelta(minutes=5):
            raise HTTPException(
                status_code=422,
                detail="measured_at cannot be in the future",
            )

    metric = HealthMetric(
        patient_id=patient_id,
        medical_record_id=data.medical_record_id,
        metric_type=data.metric_type,
        value=data.value,
        unit=data.unit,
        secondary_value=data.secondary_value,
        measured_at=measured_at,
        source=data.source or current_user.role,
    )

    db.add(metric)

    try:
        db.commit()
        db.refresh(metric)
        return {
            "message": "Health metric created successfully",
            **_metric_dict(metric),
        }
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create health metric",
        ) from exc


@router.post("/api/medical-records/{record_id}/documents", status_code=201)
def upload_medical_document(
    record_id: int,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=422, detail="Invalid document type")

    record = _record_or_404(db, record_id)

    if current_user.role == "doctor":
        doctor = _doctor_profile(db, current_user)

        if not doctor:
            raise HTTPException(
                status_code=403,
                detail="Doctor profile not found",
            )

        if not _doctor_can_edit_record(db, doctor, record):
            raise HTTPException(
                status_code=403,
                detail="You can only upload documents to your own or assigned patients' records",
            )

    elif current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to upload documents",
        )

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=415,
            detail="Only PDF files are allowed",
        )

    file_name = Path(file.filename or "document.pdf").name

    if not file_name.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=415,
            detail="Only PDF files are allowed",
        )

    storage_key = f"{record.id}/{uuid.uuid4().hex}.pdf"
    target = STORAGE_ROOT / storage_key
    target.parent.mkdir(parents=True, exist_ok=True)

    file_size = 0

    try:
        with target.open("wb") as output:
            while chunk := file.file.read(1024 * 1024):
                file_size += len(chunk)

                if file_size > MAX_DOCUMENT_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail="PDF file is larger than 10MB",
                    )

                output.write(chunk)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise
    except OSError as exc:
        target.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to store the uploaded file",
        ) from exc

    document = MedicalDocument(
        medical_record_id=record.id,
        document_type=document_type,
        file_name=file_name,
        storage_key=storage_key,
        mime_type="application/pdf",
        file_size=file_size,
        uploaded_by_user_id=current_user.id,
    )

    db.add(document)

    try:
        db.commit()
        db.refresh(document)
        return {
            "message": "Document uploaded successfully",
            **_document_dict(document),
        }
    except SQLAlchemyError as exc:
        db.rollback()
        target.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to save document metadata",
        ) from exc
