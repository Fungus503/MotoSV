import { defineRailway, project, service, dockerfile } from "railway/iac";
import { redis } from "railway/iac";

export default defineRailway(() => {
  const cache = redis("Redis", {
    volume: { mountPath: "/data", sizeMB: 500 },
  });

  const api = service("api", {
    source: { repo: "Fungus503/MotoSV" },
    build: dockerfile({ path: "apps/api/Dockerfile" }),
  });

  return project("Mototaxiapp", {
    resources: [cache, api],
  });
});
