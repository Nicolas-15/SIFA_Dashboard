import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from 'lucide-react';
import { Pagination } from "@/components/ui/Pagination";
import { TableCard } from "@/components/ui/TableCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ListView } from "@/components/ui/ListView";

import { useTokens } from "@/core/useTokens";
import { TokensTable } from "./components/TokensTable";
import { TokensMobileCards } from "./components/TokensMobileCards";
import { TokenModals } from "./components/TokenModals";

const STATUS_FILTERS = [
  { key: 'all',     label: 'Todos' },
  { key: 'active',  label: 'Activos' },
  { key: 'revoked', label: 'Revocados' },
  { key: 'expired', label: 'Expirados' },
];

export function TokenManagementView() {
  const { showToast } = useOutletContext();
  const {
    tokens, loading, error, fetchTokens, revokeToken, expireToken,
    page, totalPages, totalElements, first, last, goToPage,
  } = useTokens();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = tokens.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch =
      (item.userName || '').toLowerCase().includes(q) ||
      (item.userLastName || '').toLowerCase().includes(q) ||
      (item.userEmail || '').toLowerCase().includes(q) ||
      (item.userRut || '').toLowerCase().includes(q) ||
      (item.token || '').toLowerCase().includes(q) ||
      (item.status || '').includes(q);
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSelectItem = (item) => {
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

  const mobilePagination = (
    <div className="pt-2 text-center">
      <p className="text-xs text-slate-500 font-medium pb-1">
        {totalElements > 0
          ? `${totalElements} tokens registrados${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
          : ''
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
  );

  return (
    <ListView
      loadingLabel="tokens"
      title="Tokens de Acceso"
      filters={
        <div className="flex flex-col gap-3">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              No se pudieron cargar los tokens.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="sm:w-72">
              <Input
                icon={Search}
                placeholder="Buscar por usuario, RUT o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={search ? '!pr-8' : ''}
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {STATUS_FILTERS.map(f => (
                <Button
                  key={f.key}
                  size="sm"
                  variant={statusFilter === f.key ? 'primary' : 'outline'}
                  onClick={() => setStatusFilter(f.key)}
                  className="flex-1 sm:flex-none min-w-[90px] sm:min-w-0 max-w-[calc(50%-4px)] sm:max-w-none"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      }
      loading={loading}
      hasExistingData={tokens.length > 0}
      table={
        <TableCard
          totalElements={totalElements}
          totalPages={totalPages}
          page={page}
          first={first}
          last={last}
          loading={loading}
          onPageChange={goToPage}
          resourceLabel="tokens registrados"
        >
          <TokensTable
            filtered={filtered}
            searchQuery={search}
            activeFilter={statusFilter}
            setSelectedItem={handleSelectItem}
          />
        </TableCard>
      }
      mobile={
        <>
          <TokensMobileCards
            filtered={filtered}
            searchQuery={search}
            activeFilter={statusFilter}
            setSelectedItem={handleSelectItem}
          />
          {mobilePagination}
        </>
      }
    >
      <TokenModals
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
        handleRevokeConfirm={handleRevokeConfirm}
        handleExpireConfirm={handleExpireConfirm}
        submitting={submitting}
        selectedItem={selectedItem}
      />
    </ListView>
  );
}
