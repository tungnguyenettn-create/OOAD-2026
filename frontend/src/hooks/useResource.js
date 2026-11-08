import { useCallback, useState } from "react";

/**
 * Hook tải danh sách chung. Chấp nhận cả [] lẫn { items: [] }.
 * Mặc định loading = true vì các danh sách được tải ngay khi vào trang.
 */
export default function useResource(request, url, { errorMessage, invalidMessage }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request(url);
      const list = Array.isArray(data) ? data : data?.items;
      if (!Array.isArray(list)) throw new Error(invalidMessage);
      setItems(list);
    } catch (e) {
      setError(e.message || errorMessage);
    } finally {
      setLoading(false);
    }
  }, [request, url, errorMessage, invalidMessage]);

  return { items, loading, error, setError, load };
}
