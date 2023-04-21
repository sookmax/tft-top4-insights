export type League =
  | "CHALLENGER"
  | "GRANDMASTER"
  | "MASTER"
  | "DIAMOND"
  | "PLATINUM"
  | "GOLD"
  | "SILVER"
  | "BRONZE"
  | "IRON";

export type Rank = "I" | "II" | "III" | "IV";

export type Region =
  | "BR"
  | "EUNE"
  | "EUW"
  | "JP"
  | "KR"
  | "LAN"
  | "LAS"
  | "NA"
  | "OCE"
  | "TR"
  | "RU"
  | "PH"
  | "SG"
  | "TH"
  | "TW"
  | "VN";

export const REGIONS: Region[] = [
  "BR",
  "EUNE",
  "EUW",
  "JP",
  "KR",
  "LAN",
  "LAS",
  "NA",
  "OCE",
  "TR",
  "RU",
  "PH",
  "SG",
  "TH",
  "TW",
  "VN",
];

export type RoutingValues = {
  [Property in Region]: {
    id: Property;
    name: string;
    host: {
      platform: string;
      region: string;
    };
  };
};

// https://developer.riotgames.com/apis#match-v5/GET_getMatch
// The AMERICAS routing value serves NA, BR, LAN and LAS.
// The ASIA routing value serves KR and JP.
// The EUROPE routing value serves EUNE, EUW, TR and RU.
// The SEA routing value serves OCE, PH2, SG2, TH2, TW2 and VN2.
export const ROUTING_VALUES: RoutingValues = {
  BR: {
    id: "BR",
    name: "Brazil",
    host: {
      platform: "br1.api.riotgames.com",
      region: "americas.api.riotgames.com",
    },
  },
  EUNE: {
    id: "EUNE",
    name: "Europe Nordic & East",
    host: {
      platform: "eun1.api.riotgames.com",
      region: "europe.api.riotgames.com",
    },
  },
  EUW: {
    id: "EUW",
    name: "Europe West",
    host: {
      platform: "euw1.api.riotgames.com",
      region: "europe.api.riotgames.com",
    },
  },
  LAN: {
    id: "LAN",
    name: "Latin America North",
    host: {
      platform: "la1.api.riotgames.com",
      region: "americas.api.riotgames.com",
    },
  },
  LAS: {
    id: "LAS",
    name: "Latin America South",
    host: {
      platform: "la2.api.riotgames.com",
      region: "americas.api.riotgames.com",
    },
  },
  NA: {
    id: "NA",
    name: "North America",
    host: {
      platform: "na1.api.riotgames.com",
      region: "americas.api.riotgames.com",
    },
  },
  OCE: {
    id: "OCE",
    name: "Oceania",
    host: {
      platform: "oc1.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
  RU: {
    id: "RU",
    name: "Russia",
    host: {
      platform: "ru.api.riotgames.com",
      region: "europe.api.riotgames.com",
    },
  },
  TR: {
    id: "TR",
    name: "Turkey",
    host: {
      platform: "tr1.api.riotgames.com",
      region: "europe.api.riotgames.com",
    },
  },
  JP: {
    id: "JP",
    name: "Japan",
    host: {
      platform: "jp1.api.riotgames.com",
      region: "asia.api.riotgames.com",
    },
  },
  KR: {
    id: "KR",
    name: "Korea, South",
    host: {
      platform: "kr.api.riotgames.com",
      region: "asia.api.riotgames.com",
    },
  },
  PH: {
    id: "PH",
    name: "Philippines",
    host: {
      platform: "ph2.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
  SG: {
    id: "SG",
    name: "Singapore, Malaysia, and Indonesia",
    host: {
      platform: "sg2.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
  TW: {
    id: "TW",
    name: "Taiwan, Hong Kong, and Macao",
    host: {
      platform: "tw2.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
  TH: {
    id: "TH",
    name: "Thailand",
    host: {
      platform: "th2.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
  VN: {
    id: "VN",
    name: "Vietnam",
    host: {
      platform: "vn2.api.riotgames.com",
      region: "sea.api.riotgames.com",
    },
  },
};

const LEAGUE_SCORES: { [Property in League]: number } = {
  CHALLENGER: 8,
  GRANDMASTER: 7,
  MASTER: 6,
  DIAMOND: 5,
  PLATINUM: 4,
  GOLD: 3,
  SILVER: 2,
  BRONZE: 1,
  IRON: 0,
};

const RANK_SCORES = {
  I: 0.75,
  II: 0.5,
  III: 0.25,
  IV: 0,
};

export function getLeagueScore(league: League, rank: Rank) {
  return LEAGUE_SCORES[league] + RANK_SCORES[rank];
}

export function getLeagueFromScore(score: number): League | undefined {
  if (score < LEAGUE_SCORES.BRONZE) {
    return "IRON";
  } else if (score >= LEAGUE_SCORES.BRONZE && score < LEAGUE_SCORES.SILVER) {
    return "BRONZE";
  } else if (score >= LEAGUE_SCORES.SILVER && score < LEAGUE_SCORES.GOLD) {
    return "SILVER";
  } else if (score >= LEAGUE_SCORES.GOLD && score < LEAGUE_SCORES.PLATINUM) {
    return "GOLD";
  } else if (score >= LEAGUE_SCORES.PLATINUM && score < LEAGUE_SCORES.DIAMOND) {
    return "PLATINUM";
  } else if (score >= LEAGUE_SCORES.DIAMOND && score < LEAGUE_SCORES.MASTER) {
    return "DIAMOND";
  } else if (
    score >= LEAGUE_SCORES.MASTER &&
    score < LEAGUE_SCORES.GRANDMASTER
  ) {
    return "MASTER";
  } else if (
    score >= LEAGUE_SCORES.GRANDMASTER &&
    score < LEAGUE_SCORES.CHALLENGER
  ) {
    return "GRANDMASTER";
  } else if (score >= LEAGUE_SCORES.CHALLENGER) {
    return "CHALLENGER";
  }
}

export function sortLeagueList(
  leagueList: League[],
  options?: {
    ascending?: boolean;
  }
) {
  const sortableList = leagueList.map((league) => {
    let numValue: number;
    switch (league) {
      case "CHALLENGER":
        numValue = 8;
        break;
      case "GRANDMASTER":
        numValue = 7;
        break;
      case "MASTER":
        numValue = 6;
        break;
      case "DIAMOND":
        numValue = 5;
        break;
      case "PLATINUM":
        numValue = 4;
        break;
      case "GOLD":
        numValue = 3;
        break;
      case "SILVER":
        numValue = 2;
        break;
      case "BRONZE":
        numValue = 1;
        break;
      case "IRON":
        numValue = 0;
        break;
    }
    return {
      league,
      numValue,
    };
  });

  return sortableList
    .sort((a, b) => {
      if (a.numValue > b.numValue) {
        return options?.ascending ? 1 : -1;
      } else if (a.numValue < b.numValue) {
        return options?.ascending ? -1 : 1;
      } else {
        return 0;
      }
    })
    .map((item) => item.league);
}

const versionRegex = /.*<Releases\/(?<releaseVersion>.*)>/;
export function getReleaseVersion(versionString: string) {
  const match = versionString.match(versionRegex);
  if (match?.groups) {
    return match.groups.releaseVersion;
  }
}
