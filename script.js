const RANKS = Object.freeze([
  {
    id: "nobody",
    label: "Nobody",
    description:
      "Someone with no presence, reputation, or protection, basically invisible.",
  },
  {
    id: "shuttle",
    label: "Shuttle",
    description:
      "A bullied errand runner forced to serve others with no power of their own.",
  },
  {
    id: "scrapper",
    label: "Scrapper",
    description:
      "A low-level fighter used for bets and fights, trying to climb but still disposable.",
  },
  {
    id: "crew",
    label: "Crew",
    description:
      "A recognized member of a group who has backup and a place in the hierarchy.",
  },
  {
    id: "head",
    label: "Head",
    description:
      "The one who leads a crew or controls an area, with people under them.",
  },
  {
    id: "jjang",
    label: "Jjang",
    description:
      "The strongest and most dominant figure who stands above everyone else.",
  },
]);

const PERSONALITIES = Object.freeze([
  {
    id: "impulsive",
    label: "Impulsive",
    description: "Jumps first, thinks later, and leans toward immediate action.",
  },
  {
    id: "calculating",
    label: "Calculating",
    description: "Weights the room carefully and prefers efficient, low-risk moves.",
  },
  {
    id: "schemer",
    label: "Schemer",
    description: "Looks for angles, setups, and indirect ways to gain leverage.",
  },
  {
    id: "detached",
    label: "Detached",
    description: "Keeps emotion at a distance and acts with cold restraint.",
  },
  {
    id: "devoted",
    label: "Devoted",
    description: "Moves out of loyalty and will commit hard to the people they back.",
  },
]);

const GENDERS = Object.freeze([
  {
    id: "male",
    label: "Male",
  },
  {
    id: "female",
    label: "Female",
  },
]);

const STAT_KEYS = Object.freeze([
  "strength",
  "intelligence",
  "fear",
  "reputation",
]);

const LOCATION_DATA = {
  B2: {
    name: "Class 1",
    lineName: "",
    controller: "rival",
    power: "high",
  },
};

const POWER_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const ACTION_DEFINITIONS = {
  studyInClass: {
    label: "Study",
    durationMs: 2200,
    startText: "You sit up, crack open your notebook, and try to look serious in Class 1.",
    completeText: "You actually lock in for a bit and keep your head down.",
    outcomes: [
      {
        type: "log",
        text: "You catch enough of the lesson to not look completely lost.",
      },
    ],
  },
  sleepInClass: {
    label: "Sleep in class",
    durationMs: 2600,
    startText: "You drop your head on the desk and try to sleep through Class 1.",
    completeText: "You settle in and let the classroom noise blur out.",
    outcomes: [
      {
        type: "decision",
        prompt: "Nam flicked something at your head. What do you do?",
        choices: [
          {
            id: "punch-him",
            label: "Punch him",
            result: "You kick your chair back and swing first. The whole room snaps awake.",
          },
          {
            id: "keep-sleeping",
            label: "Keep sleeping",
            result: "You keep your eyes shut and let it slide, at least for now.",
          },
        ],
      },
      {
        type: "log",
        text: "Nothing else happens. The teacher keeps talking and the room drifts on.",
      },
    ],
  },
  observeInClass: {
    label: "Observe",
    durationMs: 1800,
    startText: "You stay quiet and watch the room instead of making a move.",
    completeText: "You track who talks, who flinches, and who keeps looking your way.",
    outcomes: [
      {
        type: "log",
        text: "You start getting a read on where the room bends and who matters here.",
      },
    ],
  },
};

const COLUMN_LABELS = "ABCDEFGHIJ";
const rankLookup = new Map(RANKS.map((rank) => [rank.id, rank]));
const personalityLookup = new Map(
  PERSONALITIES.map((personality) => [personality.id, personality]),
);
const genderLookup = new Map(GENDERS.map((gender) => [gender.id, gender]));
const actionRunCounts = new Map();
const activeActions = new Set();
const pendingDecisions = new Set();

function getRank(rankId) {
  return rankLookup.get(rankId) ?? rankLookup.get("nobody");
}

function getPersonality(personalityId) {
  return personalityLookup.get(personalityId) ?? personalityLookup.get("detached");
}

function getGender(genderId) {
  return genderLookup.get(genderId) ?? genderLookup.get("male");
}

function normalizeStats(stats = {}) {
  return Object.fromEntries(
    STAT_KEYS.map((key) => {
      const value = Number(stats[key]);

      if (Number.isNaN(value)) {
        return [key, 0];
      }

      return [key, Math.max(0, Math.min(500, Math.round(value)))];
    }),
  );
}

function createCharacter({
  id,
  firstName,
  lastName,
  rankId = "nobody",
  personalityId = "detached",
  gender = "male",
  gangId = "",
  stats = {},
  className = "",
  locationCoordinate = "",
  isRecruited = false,
}) {
  return {
    id,
    firstName,
    lastName,
    rankId: getRank(rankId).id,
    personalityId: getPersonality(personalityId).id,
    gender: getGender(gender).id,
    gangId,
    stats: normalizeStats(stats),
    className,
    locationCoordinate,
    isRecruited,
  };
}

function toCoordinate(row, column) {
  return `${COLUMN_LABELS[column]}${row + 1}`;
}

function toIndexFromCoordinate(coordinate) {
  const column = COLUMN_LABELS.indexOf(coordinate.slice(0, 1));
  const row = Number(coordinate.slice(1)) - 1;

  if (column < 0 || Number.isNaN(row) || row < 0) {
    return 0;
  }

  return row * COLUMN_LABELS.length + column;
}

function getLocationForCoordinate(coordinate) {
  return LOCATION_DATA[coordinate] ?? null;
}

const gameState = {
  profileCharacterId: "player",
  player: createCharacter({
    id: "player",
    firstName: "First",
    lastName: "Lastname",
    rankId: "nobody",
    personalityId: "detached",
    gender: "male",
    gangId: "",
    stats: {
      strength: 74,
      intelligence: 138,
      fear: 96,
      reputation: 58,
    },
    className: "Class 1",
  }),
  npcs: [
    createCharacter({
      id: "npc-001",
      firstName: "Si-heon",
      lastName: "Nam",
      rankId: "nobody",
      personalityId: "impulsive",
      gender: "male",
      gangId: "",
      stats: {
        strength: 91,
        intelligence: 68,
        fear: 117,
        reputation: 64,
      },
      className: "Class 1",
      locationCoordinate: "B2",
      isRecruited: false,
    }),
  ],
};

const playerClassLabel = document.getElementById("player-class-label");
const profileFirstName = document.getElementById("profile-first-name");
const profileLastName = document.getElementById("profile-last-name");
const playerRankLabel = document.getElementById("player-rank-label");
const playerPersonalityLabel = document.getElementById("player-personality-label");
const profileGenderLabel = document.getElementById("profile-gender-label");
const playerPersonalitySelect = document.getElementById("player-personality-select");
const themeModeSelect = document.getElementById("theme-mode-select");
const playerStatStrength = document.getElementById("player-stat-strength");
const playerStatIntelligence = document.getElementById("player-stat-intelligence");
const playerStatFear = document.getElementById("player-stat-fear");
const playerStatReputation = document.getElementById("player-stat-reputation");
const mapInfoCoordinate = document.getElementById("map-info-coordinate");
const mapInfoLocationName = document.getElementById("map-info-location-name");
const mapInfoLineName = document.getElementById("map-info-line-name");
const mapInfoActions = document.getElementById("map-info-actions");
const mapActionStudyButton = document.getElementById("map-action-study");
const mapActionSleepButton = document.getElementById("map-action-sleep");
const mapActionObserveButton = document.getElementById("map-action-observe");
const panel4NpcList = document.getElementById("panel-4-npc-list");
const panel4Empty = document.getElementById("panel-4-empty");
const panel4Sort = document.getElementById("panel-4-sort");
const panel4GenderFilter = document.getElementById("panel-4-filter-gender");
const panel4AffiliationFilter = document.getElementById("panel-4-filter-affiliation");
const panel4StatFilter = document.getElementById("panel-4-filter-stat");
const panel4StatMinFilter = document.getElementById("panel-4-filter-stat-min");
const panel6Status = document.getElementById("panel-6-status");
const panel6Log = document.getElementById("panel-6-log");
const panel6Empty = document.getElementById("panel-6-empty");

function getProfileCharacter() {
  if (gameState.profileCharacterId === gameState.player.id) {
    return gameState.player;
  }

  return (
    gameState.npcs.find((npc) => npc.id === gameState.profileCharacterId) ??
    gameState.player
  );
}

function selectProfileCharacter(characterId) {
  gameState.profileCharacterId = characterId;
  syncPlayerProfile();
  syncPlayerRank();
}

function applyThemeMode(themeMode) {
  document.body.dataset.theme = themeMode;
}

function syncPlayerRank() {
  const profileCharacter = getProfileCharacter();
  const rank = getRank(profileCharacter.rankId);

  if (playerRankLabel) {
    playerRankLabel.textContent = rank.label;
  }
}

function syncPlayerProfile() {
  const profileCharacter = getProfileCharacter();

  if (playerClassLabel) {
    playerClassLabel.textContent = profileCharacter.className;
  }

  if (profileFirstName) {
    profileFirstName.textContent = profileCharacter.firstName;
  }

  if (profileLastName) {
    profileLastName.textContent = profileCharacter.lastName;
  }

  if (playerPersonalityLabel) {
    playerPersonalityLabel.textContent = getPersonality(
      profileCharacter.personalityId,
    ).label;
  }

  if (profileGenderLabel) {
    profileGenderLabel.textContent = getGender(profileCharacter.gender).label;
  }

  if (playerPersonalitySelect) {
    playerPersonalitySelect.value = gameState.player.personalityId;
  }

  if (playerStatStrength) {
    playerStatStrength.textContent = String(profileCharacter.stats.strength);
  }

  if (playerStatIntelligence) {
    playerStatIntelligence.textContent = String(
      profileCharacter.stats.intelligence,
    );
  }

  if (playerStatFear) {
    playerStatFear.textContent = String(profileCharacter.stats.fear);
  }

  if (playerStatReputation) {
    playerStatReputation.textContent = String(profileCharacter.stats.reputation);
  }
}

function formatLineName(location) {
  if (!location) {
    return "";
  }

  const parts = [];

  if (location.lineName) {
    parts.push(location.lineName);
  }

  const powerLabel = POWER_LABELS[location.power] ?? "";

  if (powerLabel) {
    parts.push(powerLabel);
  }

  return parts.join(" / ");
}

function formatCharacterName(character) {
  return [character.lastName, character.firstName].filter(Boolean).join(" ");
}

function getAffiliation(character) {
  return character.gangId ? "gang" : "nobody";
}

function getAffiliationLabel(character) {
  return getAffiliation(character) === "gang" ? "Gang" : "Nobody";
}

function getPanel4Filters() {
  const statMin = Number(panel4StatMinFilter?.value ?? 0);

  return {
    sortBy: panel4Sort?.value ?? "name",
    gender: panel4GenderFilter?.value ?? "all",
    affiliation: panel4AffiliationFilter?.value ?? "all",
    statKey: panel4StatFilter?.value ?? "all",
    statMin: Number.isNaN(statMin)
      ? 0
      : Math.max(0, Math.min(500, Math.round(statMin))),
  };
}

function passesNpcFilters(npc) {
  const filters = getPanel4Filters();

  if (filters.gender !== "all" && npc.gender !== filters.gender) {
    return false;
  }

  if (
    filters.affiliation !== "all" &&
    getAffiliation(npc) !== filters.affiliation
  ) {
    return false;
  }

  if (
    filters.statKey !== "all" &&
    (npc.stats[filters.statKey] ?? 0) < filters.statMin
  ) {
    return false;
  }

  return true;
}

function sortNpcsForPanel4(npcs) {
  const { sortBy } = getPanel4Filters();

  return [...npcs].sort((firstNpc, secondNpc) => {
    if (STAT_KEYS.includes(sortBy)) {
      return secondNpc.stats[sortBy] - firstNpc.stats[sortBy];
    }

    if (sortBy === "gender") {
      return getGender(firstNpc.gender).label.localeCompare(
        getGender(secondNpc.gender).label,
      );
    }

    return formatCharacterName(firstNpc).localeCompare(
      formatCharacterName(secondNpc),
    );
  });
}

function formatNpcStats(npc) {
  return [
    `STR ${npc.stats.strength}`,
    `INT ${npc.stats.intelligence}`,
    `FEAR ${npc.stats.fear}`,
    `REP ${npc.stats.reputation}`,
  ];
}

function formatNpcStatsSummary(npc) {
  return `S${npc.stats.strength} I${npc.stats.intelligence} F${npc.stats.fear} R${npc.stats.reputation}`;
}

function createPanel4Cell(text, className = "") {
  const cell = document.createElement("span");

  cell.className = ["panel-4-npc-cell", className].filter(Boolean).join(" ");
  cell.textContent = text;

  return cell;
}

function getUnrecruitedNpcsForCoordinate(coordinate) {
  return gameState.npcs.filter(
    (npc) => npc.locationCoordinate === coordinate && !npc.isRecruited,
  );
}

function syncAvailableNpcs() {
  if (!panel4NpcList || !panel4Empty) {
    return;
  }

  const row = Math.floor(selectedIndex / GRID_SIZE);
  const column = selectedIndex % GRID_SIZE;
  const coordinate = toCoordinate(row, column);
  const npcs = sortNpcsForPanel4(
    getUnrecruitedNpcsForCoordinate(coordinate).filter(passesNpcFilters),
  );
  panel4NpcList.replaceChildren();

  npcs.forEach((npc) => {
    const entry = document.createElement("button");

    entry.type = "button";
    entry.className = "panel-4-npc-entry panel-4-table-grid";
    entry.dataset.characterId = npc.id;
    entry.dataset.selected = npc.id === gameState.profileCharacterId ? "true" : "false";

    entry.append(
      createPanel4Cell(formatCharacterName(npc), "panel-4-npc-name"),
      createPanel4Cell(getRank(npc.rankId).label),
      createPanel4Cell(getGender(npc.gender).label),
      createPanel4Cell(formatNpcStatsSummary(npc), "panel-4-npc-stat"),
    );
    entry.addEventListener("click", () => {
      selectProfileCharacter(npc.id);
      syncAvailableNpcs();
    });
    panel4NpcList.append(entry);
  });

  panel4Empty.hidden = npcs.length > 0;
}

function isPlayersClassLocation(location) {
  return Boolean(location && location.name === gameState.player.className);
}

function syncLogEmptyState() {
  if (!panel6Log || !panel6Empty) {
    return;
  }

  panel6Empty.hidden = panel6Log.childElementCount > 0;
}

function syncDecisionLockState() {
  if (!panel6Status) {
    return;
  }

  const isLocked = pendingDecisions.size > 0;
  panel6Status.dataset.locked = isLocked ? "true" : "false";
  panel6Status.textContent = isLocked
    ? "Waiting on a choice in the log"
    : "";
}

function createLogEntry({ state = "resolved", status, text }) {
  if (!panel6Log) {
    return null;
  }

  const entry = document.createElement("article");
  const statusLabel = document.createElement("span");
  const textNode = document.createElement("p");

  entry.className = "log-entry";
  entry.dataset.state = state;

  statusLabel.className = "log-entry-status";
  statusLabel.textContent = status;

  textNode.className = "log-entry-text";
  textNode.textContent = text;

  entry.append(statusLabel, textNode);
  panel6Log.prepend(entry);
  syncLogEmptyState();

  return {
    entry,
    statusLabel,
    textNode,
  };
}

function syncActionButtonAvailability(location = null) {
  const activeLocation =
    location ??
    getLocationForCoordinate(
      toCoordinate(Math.floor(selectedIndex / GRID_SIZE), selectedIndex % GRID_SIZE),
    );
  const isLocked = pendingDecisions.size > 0;
  const isBusy = activeActions.size > 0;
  const showClassActions = isPlayersClassLocation(activeLocation);

  if (mapInfoActions) {
    mapInfoActions.hidden = !showClassActions;
  }

  if (mapActionStudyButton) {
    mapActionStudyButton.disabled = !showClassActions || isBusy || isLocked;
  }

  if (mapActionSleepButton) {
    mapActionSleepButton.disabled = !showClassActions || isBusy || isLocked;
  }

  if (mapActionObserveButton) {
    mapActionObserveButton.disabled = !showClassActions || isBusy || isLocked;
  }
}

function resolveDecision(entry, choice, statusLabel) {
  entry.dataset.state = "resolved";
  statusLabel.textContent = "Choice made";

  const buttons = entry.querySelectorAll(".log-choice-button");
  buttons.forEach((button) => {
    button.disabled = true;
  });

  const response = document.createElement("p");
  response.className = "log-entry-response";
  response.textContent = choice.result;
  entry.append(response);

  pendingDecisions.delete(entry);
  syncDecisionLockState();
  syncActionButtonAvailability();
}

function maybeCreateDecision(actionId) {
  const action = ACTION_DEFINITIONS[actionId];

  if (!action) {
    return;
  }

  const runCount = actionRunCounts.get(actionId) ?? 0;
  const outcome = action.outcomes[runCount % action.outcomes.length];
  actionRunCounts.set(actionId, runCount + 1);

  if (outcome.type === "log") {
    createLogEntry({
      status: "Aftermath",
      text: outcome.text,
    });
    return;
  }

  const logEntry = createLogEntry({
    state: "decision",
    status: "Decision",
    text: outcome.prompt,
  });

  if (!logEntry) {
    return;
  }

  const buttonRow = document.createElement("div");
  buttonRow.className = "log-decision-buttons";

  pendingDecisions.add(logEntry.entry);
  syncDecisionLockState();
  syncActionButtonAvailability();

  outcome.choices.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "log-choice-button";
    button.textContent = choice.label;
    button.addEventListener("click", () => {
      resolveDecision(logEntry.entry, choice, logEntry.statusLabel);
    });
    buttonRow.append(button);
  });

  logEntry.entry.append(buttonRow);
}

function startAction(actionId) {
  const action = ACTION_DEFINITIONS[actionId];

  if (!action || activeActions.size > 0 || pendingDecisions.size > 0) {
    return;
  }

  const logEntry = createLogEntry({
    state: "in-progress",
    status: "In progress",
    text: action.startText,
  });

  if (!logEntry) {
    return;
  }

  const progressTrack = document.createElement("div");
  const progressFill = document.createElement("div");
  let animationFrameId = 0;
  let animationStartTime = 0;

  progressTrack.className = "log-entry-progress";
  progressFill.className = "log-entry-progress-fill";
  progressTrack.append(progressFill);
  logEntry.entry.append(progressTrack);

  activeActions.add(actionId);
  syncActionButtonAvailability();

  function animateProgress(timestamp) {
    if (animationStartTime === 0) {
      animationStartTime = timestamp;
    }

    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / action.durationMs, 1);
    const percent = Math.round(progress * 100);

    progressFill.style.width = `${percent}%`;

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animateProgress);
    }
  }

  animationFrameId = requestAnimationFrame(animateProgress);

  window.setTimeout(() => {
    cancelAnimationFrame(animationFrameId);
    progressFill.style.width = "100%";
    logEntry.entry.dataset.state = "resolved";
    logEntry.statusLabel.textContent = "Resolved";
    logEntry.textNode.textContent = action.completeText;
    progressTrack.remove();

    activeActions.delete(actionId);
    syncActionButtonAvailability();
    maybeCreateDecision(actionId);
  }, action.durationMs);
}

const GRID_SIZE = 10;
const grid = document.getElementById("map-grid");
const cells = [];
const totalCells = GRID_SIZE * GRID_SIZE;
let selectedIndex = toIndexFromCoordinate("B2");

function syncMapInfo() {
  const row = Math.floor(selectedIndex / GRID_SIZE);
  const column = selectedIndex % GRID_SIZE;
  const coordinate = toCoordinate(row, column);
  const location = getLocationForCoordinate(coordinate);

  syncAvailableNpcs();

  if (mapInfoCoordinate) {
    mapInfoCoordinate.textContent = coordinate;
  }

  if (location) {
    if (mapInfoLocationName) {
      mapInfoLocationName.textContent = location.name;
    }

    if (mapInfoLineName) {
      mapInfoLineName.textContent = formatLineName(location);
    }

    syncActionButtonAvailability(location);

    return;
  }

  if (mapInfoLocationName) {
    mapInfoLocationName.textContent = "Unmapped";
  }

  if (mapInfoLineName) {
    mapInfoLineName.textContent = "";
  }

  syncActionButtonAvailability(null);
}

function syncSelection(focusSelection = false) {
  cells.forEach((cell, index) => {
    const isSelected = index === selectedIndex;
    cell.dataset.selected = isSelected ? "true" : "false";
    cell.tabIndex = isSelected ? 0 : -1;
    cell.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  if (focusSelection) {
    cells[selectedIndex].focus({ preventScroll: true });
  }
}

function selectCell(index) {
  if (index < 0 || index >= totalCells) {
    return;
  }

  selectedIndex = index;
  syncSelection();
  syncMapInfo();
}

if (playerPersonalitySelect) {
  const options = document.createDocumentFragment();

  PERSONALITIES.forEach((personality) => {
    const option = document.createElement("option");
    option.value = personality.id;
    option.textContent = personality.label;
    options.append(option);
  });

  playerPersonalitySelect.replaceChildren(options);
  playerPersonalitySelect.addEventListener("change", () => {
    gameState.player.personalityId = getPersonality(
      playerPersonalitySelect.value,
    ).id;
    syncPlayerProfile();
  });
}

if (themeModeSelect) {
  themeModeSelect.addEventListener("change", () => {
    applyThemeMode(themeModeSelect.value);
  });
  applyThemeMode(themeModeSelect.value);
}

if (panel4Sort) {
  panel4Sort.addEventListener("change", syncAvailableNpcs);
}

if (panel4GenderFilter) {
  panel4GenderFilter.addEventListener("change", syncAvailableNpcs);
}

if (panel4AffiliationFilter) {
  panel4AffiliationFilter.addEventListener("change", syncAvailableNpcs);
}

if (panel4StatFilter) {
  panel4StatFilter.addEventListener("change", syncAvailableNpcs);
}

if (panel4StatMinFilter) {
  panel4StatMinFilter.addEventListener("input", syncAvailableNpcs);
}

syncPlayerProfile();
syncPlayerRank();
syncMapInfo();
syncLogEmptyState();
syncDecisionLockState();
syncActionButtonAvailability();

if (mapActionStudyButton) {
  mapActionStudyButton.addEventListener("click", () => {
    startAction("studyInClass");
  });
}

if (mapActionSleepButton) {
  mapActionSleepButton.addEventListener("click", () => {
    startAction("sleepInClass");
  });
}

if (mapActionObserveButton) {
  mapActionObserveButton.addEventListener("click", () => {
    startAction("observeInClass");
  });
}

if (grid) {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < totalCells; index += 1) {
    const cell = document.createElement("button");
    const row = Math.floor(index / GRID_SIZE);
    const column = index % GRID_SIZE;
    const coordinate = toCoordinate(row, column);
    const location = getLocationForCoordinate(coordinate);

    cell.type = "button";
    cell.className = "map-cell";
    cell.id = `map-cell-${index}`;
    cell.dataset.index = String(index);
    cell.dataset.row = String(row);
    cell.dataset.column = String(column);
    cell.dataset.coordinate = coordinate;

    if (location) {
      cell.dataset.controller = location.controller;
      cell.dataset.power = location.power;
      cell.setAttribute("aria-label", `${coordinate}, ${location.name}`);
    } else {
      cell.setAttribute("aria-label", coordinate);
    }

    cells.push(cell);
    fragment.appendChild(cell);
  }

  grid.replaceChildren(fragment);
  syncSelection();
  syncMapInfo();

  grid.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const cell = target.closest(".map-cell");

    if (!(cell instanceof HTMLButtonElement)) {
      return;
    }

    selectCell(Number(cell.dataset.index));
  });

  grid.addEventListener("keydown", (event) => {
    let nextIndex = selectedIndex;

    switch (event.key) {
      case "ArrowUp":
        nextIndex -= GRID_SIZE;
        break;
      case "ArrowDown":
        nextIndex += GRID_SIZE;
        break;
      case "ArrowLeft":
        nextIndex -= 1;
        break;
      case "ArrowRight":
        nextIndex += 1;
        break;
      default:
        return;
    }

    if (nextIndex < 0 || nextIndex >= totalCells) {
      return;
    }

    const currentColumn = selectedIndex % GRID_SIZE;
    const nextColumn = nextIndex % GRID_SIZE;

    if (
      (event.key === "ArrowLeft" && nextColumn > currentColumn) ||
      (event.key === "ArrowRight" && nextColumn < currentColumn)
    ) {
      return;
    }

    event.preventDefault();
    selectCell(nextIndex);
    syncSelection(true);
  });
}
