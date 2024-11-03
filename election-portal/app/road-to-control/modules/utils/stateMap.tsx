const presData = [
  { "hc-key": "us-al", Called: "R", electoralVotes: 9 },
  { "hc-key": "us-ak", Called: "D", electoralVotes: 3 },
  { "hc-key": "us-az", Called: "D", electoralVotes: 11 },
  { "hc-key": "us-ar", Called: "D", electoralVotes: 6 },
  { "hc-key": "us-ca", Called: "D", electoralVotes: 55 },
  { "hc-key": "us-co", Called: "R", electoralVotes: 9 },
  { "hc-key": "us-ct", Called: "R", electoralVotes: 7 },
  { "hc-key": "us-de", Called: "D", electoralVotes: 3 },
  { "hc-key": "us-dc", Called: "R", electoralVotes: 3 },
  { "hc-key": "us-fl", Called: "R", electoralVotes: 29 },
  { "hc-key": "us-ga", Called: "D", electoralVotes: 16 },
  { "hc-key": "us-hi", Called: "D", electoralVotes: 4 },
  { "hc-key": "us-id", Called: "R", electoralVotes: 4 },
  { "hc-key": "us-il", Called: "R", electoralVotes: 20 },
  { "hc-key": "us-in", Called: "R", electoralVotes: 11 },
  { "hc-key": "us-ia", Called: "D", electoralVotes: 6 },
  { "hc-key": "us-ks", Called: "D", electoralVotes: 6 },
  { "hc-key": "us-ky", Called: "R", electoralVotes: 8 },
  { "hc-key": "us-la", Called: "R", electoralVotes: 8 },
  { "hc-key": "us-me", Called: "D", electoralVotes: 4 },
  { "hc-key": "us-md", Called: "R", electoralVotes: 10 },
  { "hc-key": "us-ma", Called: "D", electoralVotes: 11 },
  { "hc-key": "us-mi", Called: "R", electoralVotes: 16 },
  { "hc-key": "us-mn", Called: "R", electoralVotes: 10 },
  { "hc-key": "us-ms", Called: "D", electoralVotes: 6 },
  { "hc-key": "us-mo", Called: "R", electoralVotes: 10 },
  { "hc-key": "us-mt", Called: "D", electoralVotes: 3 },
  { "hc-key": "us-ne", Called: "R", electoralVotes: 5 },
  { "hc-key": "us-nv", Called: "D", electoralVotes: 6 },
  { "hc-key": "us-nh", Called: "R", electoralVotes: 4 },
  { "hc-key": "us-nj", Called: "D", electoralVotes: 14 },
  { "hc-key": "us-nm", Called: "R", electoralVotes: 5 },
  { "hc-key": "us-ny", Called: "D", electoralVotes: 29 },
  { "hc-key": "us-nc", Called: "R", electoralVotes: 15 },
  { "hc-key": "us-nd", Called: "R", electoralVotes: 3 },
  { "hc-key": "us-oh", Called: "D", electoralVotes: 18 },
  { "hc-key": "us-ok", Called: "D", electoralVotes: 7 },
  { "hc-key": "us-or", Called: "N", electoralVotes: 7 },
  { "hc-key": "us-pa", Called: "N", electoralVotes: 20 },
  { "hc-key": "us-ri", Called: "R", electoralVotes: 4 },
  { "hc-key": "us-sc", Called: "D", electoralVotes: 9 },
  { "hc-key": "us-sd", Called: "R", electoralVotes: 3 },
  { "hc-key": "us-tn", Called: "D", electoralVotes: 11 },
  { "hc-key": "us-tx", Called: "D", electoralVotes: 38 },
  { "hc-key": "us-ut", Called: "R", electoralVotes: 6 },
  { "hc-key": "us-vt", Called: "R", electoralVotes: 3 },
  { "hc-key": "us-va", Called: "D", electoralVotes: 13 },
  { "hc-key": "us-wa", Called: "N", electoralVotes: 12 },
  { "hc-key": "us-wv", Called: "N", electoralVotes: 5 },
  { "hc-key": "us-wi", Called: "N", electoralVotes: 10 },
  { "hc-key": "us-wy", Called: "N", electoralVotes: 3 },
];

export const emptyMapData = presData.map((item) => ({ ...item, Called: "N" }));