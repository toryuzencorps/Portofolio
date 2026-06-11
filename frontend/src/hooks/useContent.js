import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

async function fetchContent() {
  const { data } = await api.get("/content");
  return data;
}

export function useContent() {
  const qc = useQueryClient();
  const { data: content, isLoading: loading } = useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    staleTime: 30_000,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["content"] });
  return { content, loading, refresh };
}
