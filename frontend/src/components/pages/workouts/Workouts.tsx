import { useState, useMemo } from 'react'
import WorkoutCard from '@/components/pages/workouts/WorkoutCard'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'
import { routes } from '@/lib/constants'
import { PlusCircleIcon, Search, ArrowUp, ArrowDown } from 'lucide-react'
import EmptyState from '@/components/ui/widgets/EmptyState'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAdminWorkouts } from '@/hooks/useAdminWorkouts'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { Workout } from '@/types/Workout'
import { WorkoutAdmin } from '@/types/AdminWorkout'

const Workouts = () => {
  const navigate = useNavigate()
  const { isUserAdmin } = useAuth()
  const { t } = useTranslation()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const pageSize = 5

  const { data: userWorkouts = [], isLoading: userLoading } = useWorkouts()

  const { data: adminResponse, isLoading: adminLoading } =
    useAdminWorkouts(page, pageSize, search, isUserAdmin)

  const totalCount = isUserAdmin ? adminResponse?.totalCount ?? 0 : 0

  const totalPages = isUserAdmin ? Math.ceil(totalCount / pageSize) : 0

  const isLoading = isUserAdmin ? adminLoading : userLoading

  const handleCreateWorkout = () => {
    navigate(routes.CreateWorkout)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedAdminWorkouts = useMemo<WorkoutAdmin[]>(() => {
    const adminWorkouts = adminResponse?.items ?? []

    return [...adminWorkouts].sort((a, b) => {
      const aValue = a.name.toLowerCase()
      const bValue = b.name.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [adminResponse?.items, sortDirection])

  const sortedUserWorkouts = useMemo<Workout[]>(() => {
    return [...userWorkouts].sort((a, b) => {
      const aValue = (a.name ?? '').toLowerCase()
      const bValue = (b.name ?? '').toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [userWorkouts, sortDirection])

  const displayedWorkouts = isUserAdmin ? sortedAdminWorkouts : sortedUserWorkouts

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {t('workouts.title')}
        </h2>

        {isUserAdmin && <LanguageSwitcher />}

        {!isUserAdmin && (
          <Button onClick={handleCreateWorkout}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            {t('workouts.create')}
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={
            isUserAdmin
              ? t('workouts.searchAdmin')
              : t('workouts.search')
          }
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {displayedWorkouts.length > 0 ? (
        isUserAdmin ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">

                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wide">
                  <tr>

                    <th
                      className="px-6 py-3 text-left cursor-pointer"
                      onClick={handleSort}
                    >
                      <div className="flex items-center gap-2">
                        {t('workouts.workout')}
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('workouts.trainer')}
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('workouts.client')}
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('workouts.created')}
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">
                  {sortedAdminWorkouts.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/40 transition-colors">

                      <td className="px-6 py-4 font-medium">
                        {w.name}
                      </td>

                      <td className="px-6 py-4">
                        {w.trainerName}
                      </td>

                      <td className="px-6 py-4">
                        {w.clientName}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="flex items-center justify-between mt-4">

              <div className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </div>

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  {t('common.previous')}
                </Button>

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  {t('common.next')}
                </Button>

              </div>
            </div>
          </>
        ) : (
          <div className="workout-card-wrapper">
            {sortedUserWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )
      ) : (
        <>
          {isUserAdmin ? (
            <EmptyState
              title={t('workouts.noResults')}
              description={t('workouts.noResultsDescription')}
            />
          ) : (
            <EmptyState
              title={t('workouts.noWorkouts')}
              description={t('workouts.createFirst')}
              buttonText={t('workouts.createFirstButton')}
              buttonAction={handleCreateWorkout}
              buttonIcon={<PlusCircleIcon className="h-4 w-4" />}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Workouts
