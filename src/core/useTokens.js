import { useState, useCallback, useRef } from "react";
import * as tokenService from "@/services/token.service";

const normalizeToken = (item) => ({
  id: item.idToken,
  token: item.token || '',
  tokenType: item.tokenType || 'Bearer',
  userName: item.userName || '',
  userLastName: item.userLastName || '',
  userEmail: item.userEmail || '',
  userRut: item.userRut || '',
  revoked: item.revoked ?? false,
  expired: item.expired ?? false,
  status: item.expired ? 'expired' : item.revoked ? 'revoked' : 'active',
});

export const useTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size] = useState(10);

  const latestParams = useRef({ page: 0 });
  latestParams.current = { page };

  const fetchTokens = useCallback(async (overrides) => {
    setLoading(true);
    setError(null);
    try {
      const p = overrides || latestParams.current;
      const data = await tokenService.getTokens({ page: p.page, size });

      const list = Array.isArray(data.content) ? data.content : [];
      setTokens(list.map(normalizeToken));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setFirst(data.first ?? true);
      setLast(data.last ?? true);
      if (data.number !== undefined) {
        setPage(data.number);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setTokens([]);
      setError(
        err.message.includes("403")
          ? "No tienes permisos para ver los tokens"
          : "No se pudieron cargar los tokens"
      );
      throw new Error("No se pudieron cargar los tokens");
    } finally {
      setLoading(false);
    }
  }, [size]);

  const goToPage = useCallback((p) => {
    setPage(p);
  }, []);

  const doRevokeToken = async (id) => {
    await tokenService.revokeToken(id);
    setTokens((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, revoked: true, expired: false, status: 'revoked' } : t
      )
    );
  };

  const doExpireToken = async (id) => {
    await tokenService.expireToken(id);
    setTokens((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, expired: true, revoked: false, status: 'expired' } : t
      )
    );
  };

  return {
    tokens,
    loading,
    error,
    fetchTokens,
    revokeToken: doRevokeToken,
    expireToken: doExpireToken,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  };
};
