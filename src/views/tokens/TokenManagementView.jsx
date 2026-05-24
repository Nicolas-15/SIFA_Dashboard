import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Pagination } from "@/components/ui/Pagination";

import { useTokens } from "@/core/useTokens";
import { TokenHeader } from "./components/TokenHeader";
import { TokenTable } from "./components/TokenTable";
import { TokenModals } from "./components/TokenModals";

export function TokenManagementView() {
  const { showToast } = useOutletContext();
  const {
    tokens, loading, fetchTokens, revokeToken, expireToken,
    page, totalPages, totalElements, first, last, goToPage,
  } = useTokens();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTokens().catch((err) => {
      const isAuthError =
        err.message.includes("401") ||
        err.message.includes("403") ||
        err.message.includes("Unauthorized") ||
        err.message.includes("Forbidden");

      if (!isAuthError) {
        showToast("No se pudieron cargar los tokens", "error");
      }
    });
  }, [page, fetchTokens, showToast]);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleRevokeConfirm = async (item) => {
    setSubmitting('revoke');
    try {
      await revokeToken(item.id);
      showToast("Token revocado exitosamente", "success");
      setSelectedItem((prev) => prev?.id === item.id
        ? { ...prev, revoked: true, expired: false, status: 'revoked' }
        : prev
      );
    } catch (err) {
      showToast(err.message || "Error al revocar el token", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpireConfirm = async (item) => {
    setSubmitting('expire');
    try {
      await expireToken(item.id);
      showToast("Token expirado exitosamente", "success");
      setSelectedItem((prev) => prev?.id === item.id
        ? { ...prev, expired: true, revoked: false, status: 'expired' }
        : prev
      );
    } catch (err) {
      showToast(err.message || "Error al expirar el token", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTokens = tokens.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.userName || '').toLowerCase().includes(q) ||
      (item.userLastName || '').toLowerCase().includes(q) ||
      (item.userEmail || '').toLowerCase().includes(q) ||
      (item.userRut || '').toLowerCase().includes(q) ||
      (item.token || '').toLowerCase().includes(q) ||
      item.status.includes(q);
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      <TokenHeader
        search={search}
        setSearch={setSearch}
      />

      <div className="flex items-center gap-2">
        {[
          { key: 'all',     label: 'Todos' },
          { key: 'active',  label: 'Activos' },
          { key: 'revoked', label: 'Revocados' },
          { key: 'expired', label: 'Expirados' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === f.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <TokenTable
        loading={loading}
        filteredTokens={filteredTokens}
        search={search}
        onSelect={handleSelect}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {totalElements > 0
            ? `${totalElements} tokens registrados${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
            : loading ? 'Cargando tokens...' : ''
          }
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          first={first}
          last={last}
          onPageChange={goToPage}
          loading={loading}
        />
      </div>

      <TokenModals
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
        handleRevokeConfirm={handleRevokeConfirm}
        handleExpireConfirm={handleExpireConfirm}
        submitting={submitting}
        selectedItem={selectedItem}
      />
    </div>
  );
}
