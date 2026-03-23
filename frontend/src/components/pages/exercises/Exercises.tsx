import { useState, useMemo } from 'react'
import ExerciseDialog from '@/components/pages/exercises/ExerciseDialog'
import DeleteExerciseDialog from '@/components/pages/exercises/DeleteExerciseDialog'
import { Button } from '@/components/ui/button'
import { PlusCircleIcon, Search, Pencil, Trash2, Users, ArrowUp, ArrowDown } from 'lucide-react'
import EmptyState from '@/components/ui/widgets/EmptyState'
import { useExercises } from '@/hooks/useExercises'
import { useAdminExercises } from '@/hooks/useAdminExercise'
import { useAuth } from '@/components/auth/AuthProvider'
import { Badge } from '@/components/ui/badge'
import { SortableTable, Column } from '@/components/ui/widgets/SortableTable'
import { Exercise } from '@/types/Exercise'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { ExerciseAdmin } from '@/types/AdminExercise'

const Exercises = () => {
  const { isUserAdmin, userId } = useAuth()
  const { t } = useTranslation()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const pageSize = 5

  const { data: userExercises = [], isLoading: userLoading } = useExercises()

  const { data: adminResponse, isLoading: adminLoading } =
    useAdminExercises(page, pageSize, search, isUserAdmin)

  const adminExercises = adminResponse?.items ?? []

  const totalPages = Math.ceil((adminResponse?.totalCount ?? 0) / pageSize)

  const isLoading = isUserAdmin ? adminLoading : userLoading

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const handleCreateExercise = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsEditDialogOpen(true)
  }

  const handleDeleteExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsDeleteDialogOpen(true)
  }

  const handleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const sortedExercises = useMemo(() => {
    const sorted = [...adminExercises].sort((a, b) => {
      const aValue = a.name.toLowerCase()
      const bValue = b.name.toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [adminExercises, sortDirection])

  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (exercise) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{exercise.name}</span>
          {exercise.isPublic && (
            <Badge variant="secondary" className="gap-1">
              <Users className="h-3 w-3" />
              Shared
            </Badge>
          )}
        </div>
      ),
      className: 'max-w-[200px]',
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (exercise) => (
        <div className="max-w-md overflow-hidden">
          <span className="text-muted-foreground line-clamp-2 break-words">
            {exercise.description || '-'}
          </span>
        </div>
      ),
      className: 'max-w-[300px] truncate',
    },
    {
      key: 'muscleGroup',
      label: 'Muscle Group',
      sortable: true,
      render: (exercise) =>
        exercise.muscleGroup ? (
          <Badge variant="outline">{exercise.muscleGroup}</Badge>
        ) : (
          '-'
        ),
      className: 'w-[150px]',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (exercise) => {
        const isOwnExercise = exercise.createdById === userId
        return isOwnExercise ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleEditExercise(exercise)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteExercise(exercise)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">View only</span>
        )
      },
      className: 'w-[120px]',
    },
  ]

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">{t('common.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">

      {isUserAdmin && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('exercises.title')}</h2>
          <LanguageSwitcher />
        </div>
      )}

      {!isUserAdmin && (
        <Button className="self-start" onClick={handleCreateExercise}>
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          {t('exercises.create')}
        </Button>
      )}

      {isUserAdmin && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={t('exercises.search')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {sortedExercises.length > 0 ? (
        isUserAdmin ? (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="min-w-full text-sm">

                <thead className="bg-muted/50 text-xs uppercase">
                  <tr>

                    <th
                      className="px-6 py-3 text-left cursor-pointer"
                      onClick={handleSort}
                    >
                      <div className="flex items-center gap-2">
                        {t('exercises.name')}
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('exercises.createdBy')}
                    </th>

                    <th className="px-6 py-3 text-left">
                      {t('exercises.created')}
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">
                  {sortedExercises.map((e: ExerciseAdmin) => (
                    <tr key={e.id} className="hover:bg-muted/40">

                      <td className="px-6 py-4 font-medium">
                        {e.name}
                      </td>

                      <td className="px-6 py-4">
                        {e.createdBy}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            <div className="flex justify-between items-center mt-4">

              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('common.previous')}
              </Button>

              <span className="text-sm text-muted-foreground">
                {t('common.page')} {page} {t('common.of')} {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
              </Button>

            </div>
          </>
        ) : (
          <SortableTable
            data={userExercises}
            columns={columns}
            emptyMessage={t('exercises.noExercises')}
          />
        )
      ) : (
        <EmptyState
          title={t('exercises.noExercises')}
          description={
            isUserAdmin
              ? t('exercises.noResults')
              : t('exercises.createFirst')
          }
          buttonText={!isUserAdmin ? t('exercises.create') : undefined}
          buttonAction={!isUserAdmin ? handleCreateExercise : undefined}
          buttonIcon={!isUserAdmin ? <PlusCircleIcon /> : undefined}
        />
      )}

      <ExerciseDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {selectedExercise && (
        <>
          <ExerciseDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            mode="edit"
            exercise={selectedExercise}
          />

          <DeleteExerciseDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            exercise={selectedExercise}
          />
        </>
      )}
    </div>
  )
}

export default Exercises
