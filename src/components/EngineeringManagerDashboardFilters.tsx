import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Select from 'react-select';
import type { RepositoryStatsDto, TeamMetricsDto } from '@/types/dashboard.types';
import type { TeamDto, TeamMemberDto } from '@/types/user.types';

interface EngineeringManagerDashboardFiltersProps {
  repositories: RepositoryStatsDto[];
  selectedRepositoryIds: number[];
  onRepositoryIdsChange: (ids: number[]) => void;
  teams: TeamDto[];
  selectedTeamIds: number[];
  onTeamIdsChange: (ids: number[]) => void;
  availableMembers: TeamMemberDto[];
  selectedMemberIds: number[];
  onMemberIdsChange: (ids: number[]) => void;
  onTeamMembersUpdate: (members: TeamMemberDto[]) => void;
  teamsWithRepos: TeamMetricsDto[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onApplyFilters: () => void;
}

export function EngineeringManagerDashboardFilters({
  repositories,
  selectedRepositoryIds,
  onRepositoryIdsChange,
  teams,
  selectedTeamIds,
  onTeamIdsChange,
  availableMembers,
  selectedMemberIds,
  onMemberIdsChange,
  onTeamMembersUpdate,
  teamsWithRepos,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApplyFilters,
}: EngineeringManagerDashboardFiltersProps) {

  // Filter available repositories based on selected teams
  const availableRepositories = useMemo(() => {
    if (selectedTeamIds.length === 0) {
      // No teams selected = show all repositories
      return repositories;
    }

    // Get repositories from selected teams
    const repoIdsFromSelectedTeams = new Set<number>();
    teamsWithRepos
      .filter((team) => selectedTeamIds.includes(team.teamId))
      .forEach((team) => {
        team.repositories.forEach((repo) => {
          repoIdsFromSelectedTeams.add(repo.repositoryId);
        });
      });

    // Filter to only show repositories from selected teams
    return repositories.filter((repo) =>
      repoIdsFromSelectedTeams.has(repo.repositoryId)
    );
  }, [repositories, selectedTeamIds, teamsWithRepos]);

  // Clear repository selection when teams change
  useEffect(() => {
    if (selectedTeamIds.length > 0) {
      // Clear repository selection when teams change
      const availableRepoIds = new Set(availableRepositories.map((r) => r.repositoryId));
      const validSelectedRepos = selectedRepositoryIds.filter((id) =>
        availableRepoIds.has(id)
      );
      if (validSelectedRepos.length !== selectedRepositoryIds.length) {
        onRepositoryIdsChange(validSelectedRepos);
      }
    }
  }, [selectedTeamIds, availableRepositories]);

  // Fetch members when selected teams change (hierarchical filtering)
  useEffect(() => {
    const fetchMembersFromSelectedTeams = async () => {
      if (selectedTeamIds.length === 0) {
        // No teams selected = no members available
        onTeamMembersUpdate([]);
        onMemberIdsChange([]);
        return;
      }

      try {
        const apiUrl = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL;

        // Fetch members from all selected teams
        const memberPromises = selectedTeamIds.map(async (teamId) => {
          const response = await fetch(`${apiUrl}/api/v1/teams/${teamId}/members`, {
            credentials: 'include',
          });
          if (!response.ok) {
            console.error(`Error fetching members for team ${teamId}`);
            return [];
          }
          const members: TeamMemberDto[] = await response.json();
          return members;
        });

        const memberArrays = await Promise.all(memberPromises);

        // Flatten and deduplicate members (aunque backend garantiza que no hay duplicados)
        const allMembers = memberArrays.flat();
        const uniqueMembers = Array.from(
          new Map(allMembers.map((m) => [m.userId, m])).values()
        );

        onTeamMembersUpdate(uniqueMembers);

        // Clear selected members if they're no longer in available members
        const availableMemberIds = new Set(uniqueMembers.map((m) => m.userId));
        const validSelectedMembers = selectedMemberIds.filter((id) =>
          availableMemberIds.has(id)
        );
        if (validSelectedMembers.length !== selectedMemberIds.length) {
          onMemberIdsChange(validSelectedMembers);
        }
      } catch (err) {
        console.error('Error fetching team members:', err);
        onTeamMembersUpdate([]);
      }
    };

    fetchMembersFromSelectedTeams();
  }, [selectedTeamIds]);

  // Convert to react-select options (use filtered repositories)
  const repositoryOptions = availableRepositories.map((repo) => ({
    value: repo.repositoryId,
    label: repo.repositoryName,
  }));

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const memberOptions = availableMembers.map((member) => ({
    value: member.userId,
    label: `@${member.githubUsername}`,
  }));

  // Get selected options from IDs
  const selectedRepoOptions = repositoryOptions.filter((option) =>
    selectedRepositoryIds.includes(option.value)
  );

  const selectedTeamOptions = teamOptions.filter((option) =>
    selectedTeamIds.includes(option.value)
  );

  const selectedMemberOptions = memberOptions.filter((option) =>
    selectedMemberIds.includes(option.value)
  );

  // Handle selection change
  const handleRepoChange = (selected: readonly { value: number; label: string }[] | null) => {
    const ids = selected ? selected.map((option) => option.value) : [];
    onRepositoryIdsChange(ids);
  };

  const handleTeamChange = (selected: readonly { value: number; label: string }[] | null) => {
    const ids = selected ? selected.map((option) => option.value) : [];
    onTeamIdsChange(ids);
  };

  const handleMemberChange = (selected: readonly { value: number; label: string }[] | null) => {
    const ids = selected ? selected.map((option) => option.value) : [];
    onMemberIdsChange(ids);
  };

  const handleSelectAllRepos = () => {
    onRepositoryIdsChange(availableRepositories.map((r) => r.repositoryId));
  };

  const handleDeselectAllRepos = () => {
    onRepositoryIdsChange([]);
  };

  const handleSelectAllTeams = () => {
    onTeamIdsChange(teams.map((t) => t.id));
  };

  const handleDeselectAllTeams = () => {
    onTeamIdsChange([]);
  };

  const handleSelectAllMembers = () => {
    onMemberIdsChange(availableMembers.map((m) => m.userId));
  };

  const handleDeselectAllMembers = () => {
    onMemberIdsChange([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primera línea: Repositorios */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Repositorios
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllRepos}
                className="text-xs text-blue-600 hover:underline"
              >
                Todos
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={handleDeselectAllRepos}
                className="text-xs text-blue-600 hover:underline"
              >
                Ninguno
              </button>
            </div>
          </div>
          <Select
            isMulti
            value={selectedRepoOptions}
            onChange={handleRepoChange}
            options={repositoryOptions}
            placeholder="Seleccionar repositorios..."
            noOptionsMessage={() => 'No se encontraron repositorios'}
            closeMenuOnSelect={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#e0e7ff',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#3730a3',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#3730a3',
                '&:hover': {
                  backgroundColor: '#c7d2fe',
                  color: '#312e81',
                },
              }),
            }}
          />
        </div>

        {/* Segunda línea: Equipos */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Equipos
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllTeams}
                className="text-xs text-blue-600 hover:underline"
              >
                Todos
              </button>
              <span className="text-gray-400">|</span>
              <button
                type="button"
                onClick={handleDeselectAllTeams}
                className="text-xs text-blue-600 hover:underline"
              >
                Ninguno
              </button>
            </div>
          </div>
          <Select
            isMulti
            value={selectedTeamOptions}
            onChange={handleTeamChange}
            options={teamOptions}
            placeholder="Seleccionar equipos..."
            noOptionsMessage={() => 'No se encontraron equipos'}
            closeMenuOnSelect={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#fef3c7',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#92400e',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#92400e',
                '&:hover': {
                  backgroundColor: '#fde68a',
                  color: '#78350f',
                },
              }),
            }}
          />
        </div>

        {/* Tercera línea: Miembros del Equipo (filtrado jerárquico) */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-medium text-gray-700">
              Miembros del Equipo
            </label>
            {selectedTeamIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllMembers}
                  className="text-xs text-blue-600 hover:underline"
                  disabled={availableMembers.length === 0}
                >
                  Todos
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllMembers}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ninguno
                </button>
              </div>
            )}
          </div>
          <Select
            isMulti
            value={selectedMemberOptions}
            onChange={handleMemberChange}
            options={memberOptions}
            placeholder={
              selectedTeamIds.length === 0
                ? 'Primero selecciona equipos...'
                : 'Seleccionar miembros...'
            }
            isDisabled={selectedTeamIds.length === 0}
            noOptionsMessage={() =>
              selectedTeamIds.length === 0
                ? 'Selecciona equipos primero'
                : 'No se encontraron miembros'
            }
            closeMenuOnSelect={false}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base) => ({
                ...base,
                minHeight: '42px',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                },
              }),
              multiValue: (base) => ({
                ...base,
                backgroundColor: '#dcfce7',
              }),
              multiValueLabel: (base) => ({
                ...base,
                color: '#166534',
              }),
              multiValueRemove: (base) => ({
                ...base,
                color: '#166534',
                '&:hover': {
                  backgroundColor: '#bbf7d0',
                  color: '#14532d',
                },
              }),
            }}
          />
        </div>

        {/* Cuarta línea: Filtros de fecha y botón Aplicar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={onApplyFilters} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}