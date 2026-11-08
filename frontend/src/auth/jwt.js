export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    // Tách lấy phần payload (phần thứ 2 của JWT sau dấu chấm)
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    // Đổi chuẩn Base64Url sang Base64 thông thường
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Giải mã bằng atob và xử lý lỗi font chữ tiếng Việt (UTF-8) nếu có
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return null;
  }
};