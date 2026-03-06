import { useState, useMemo } from 'react'
import DietPlanCard from '@/components/pages/diet-plans/DietPlanCard'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { routes } from '@/lib/constants'
import { PlusCircleIcon, Search, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import EmptyState from '@/components/ui/widgets/EmptyState'
import { useDietPlans } from '@/hooks/useDietPlans'
import { useAuth } from '@/components/auth/AuthProvider'
import { useAdminDietPlans } from '@/hooks/useAdminDietPlans'
import adminService from '@/api/services/adminService'
import { toast } from 'sonner'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

const DietPlans = () => {
  const navigate = useNavigate()
  const { isUserTrainer, isUserAdmin } = useAuth()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | null>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const pageSize = 5

  const { data: dietPlans = [], isLoading: userLoading } = useDietPlans()

  const { data: adminResponse, isLoading: adminLoading } = useAdminDietPlans(
    page,
    pageSize,
    search,
    isUserAdmin
  )

  const adminDietPlans = adminResponse?.items ?? []
  const totalPages = Math.ceil((adminResponse?.totalCount ?? 0) / pageSize)

  const isLoading = isUserAdmin ? adminLoading : userLoading

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCreateDietPlan = () => {
    navigate(routes.CreateDietPlan)
  }

  const handleDeleteDietPlan = async () => {
    if (deleteId == null) return

    try {
      setIsDeleting(true)
      await adminService.deleteDietPlan(deleteId)
      toast.success(t('dietPlans.deleted'))
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e?.message || t('dietPlans.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSort = (field: 'name') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedDietPlans = useMemo(() => {
    if (!sortField) return adminDietPlans

    const sorted = [...adminDietPlans].sort((a, b) => {
      const aValue = a[sortField]?.toLowerCase()
      const bValue = b[sortField]?.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [adminDietPlans, sortField, sortDirection])

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>
  }

  if (isUserAdmin) {
    const hasData = sortedDietPlans.length > 0

    return (
      <div className="flex flex-col gap-6 p-6">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('dietPlans.title')}</h2>
          <LanguageSwitcher />
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={t('dietPlans.search')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {hasData ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">

                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wide">
                  <tr>

                    <th
                      className="px-6 py-3 text-left cursor-pointer select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        {t('dietPlans.plan')}
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('dietPlans.trainer')}
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('dietPlans.client')}
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('dietPlans.created')}
                    </th>

                    <th className="px-6 py-3 text-right">
                      {t('dietPlans.actions')}
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {sortedDietPlans.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/40 transition-colors">

                      <td className="px-6 py-4 font-medium">{d.name}</td>
                      <td className="px-6 py-4">{d.trainerName}</td>
                      <td className="px-6 py-4">{d.clientName}</td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right">

                        <Dialog
                          open={deleteId === d.id}
                          onOpenChange={(open) => setDeleteId(open ? d.id : null)}
                        >

                          <Button variant="destructive" size="sm" asChild>
                            <DialogTrigger>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DialogTrigger>
                          </Button>

                          <DialogContent>

                            <DialogHeader>
                              <DialogTitle>
                                {t('dietPlans.deleteTitle')}
                              </DialogTitle>

                              <DialogDescription>
                                {t('dietPlans.deleteDescription', { name: d.name })}
                              </DialogDescription>
                            </DialogHeader>

                            <DialogFooter>

                              <Button
                                variant="destructive"
                                onClick={handleDeleteDietPlan}
                                disabled={isDeleting}
                              >
                                {isDeleting ? t('common.deleting') : t('common.delete')}
                              </Button>

                              <DialogClose asChild>
                                <Button variant="outline" disabled={isDeleting}>
                                  {t('common.cancel')}
                                </Button>
                              </DialogClose>

                            </DialogFooter>

                          </DialogContent>

                        </Dialog>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>

            <div className="flex justify-between items-center">

              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('common.previous')}
              </Button>

              <span className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {Math.max(totalPages, 1)}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages || totalPages === 0}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
              </Button>

            </div>
          </>
        ) : (
          <EmptyState
            title={t('dietPlans.noResults')}
            description={t('dietPlans.noResultsDescription')}
            buttonText=""
            buttonAction={() => {}}
            buttonIcon={undefined}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">

      {dietPlans.length > 0 && (
        <div className="flex flex-col gap-2">

          {isUserTrainer && (
            <Button className="self-start" onClick={handleCreateDietPlan}>
              {t('dietPlans.create')}
            </Button>
          )}

          <div className="diet-plan-card-wrapper">
            {dietPlans.map((dietPlan) => (
              <DietPlanCard key={dietPlan.id} dietPlan={dietPlan} />
            ))}
          </div>

        </div>
      )}

      {dietPlans.length === 0 && !userLoading && (
        <EmptyState
          title={t('dietPlans.noPlans')}
          description={
            isUserTrainer
              ? t('dietPlans.noPlansTrainer')
              : t('dietPlans.noPlansClient')
          }
          buttonText={isUserTrainer ? t('dietPlans.createFirst') : ''}
          buttonAction={isUserTrainer ? handleCreateDietPlan : () => {}}
          buttonIcon={
            isUserTrainer ? <PlusCircleIcon className="h-4 w-4" /> : undefined
          }
        />
      )}

    </div>
  )
}

export default DietPlans