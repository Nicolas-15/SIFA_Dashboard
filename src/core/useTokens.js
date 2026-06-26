import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
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
  expiresAt: item.expiresAt || null,
  createdAt: item.createdAt || null,
  modifiedAt: item.modifiedAt || null,
  status: item.expired ? 'expired' : item.revoked ? 'revoked' : 'active',
});

export const useTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(true);
  const [size] = useState(10);

  const { isAuthenticated } = useAuth();

  const latestParams = useRef({ page: 0 });
  latestParams.current = { page };

  const doFetch = useCallback(async (overrides) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);

    try {
      const p = overrides || latestParams.current;
      const data = await tokenService.getTokens({ page: p.page, size });

      const list = Array.isArray(data.content) ? data.content : [];
      setTokens(list.map(normalizeToken));
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
      setFirst(data.first ?? true);
      setLast(data.last ?? true);

      if (data.number !== undefined && data.number !== p.page) {
        setPage(data.number);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, size]);

  useEffect(() => {
    doFetch();
  }, [page, doFetch]);

  const goToPage = useCallback((p) => setPage(p), []);

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
    fetchTokens: doFetch,
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
