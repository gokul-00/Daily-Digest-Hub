import { useCallback, useEffect, useMemo, useState } from "react";

import {
  readDigestInteractions,
  writeDigestInteractions,
  type DigestInteractions,
} from "@/lib/digest-interactions";

export function useDigestInteractions(
  userId: string | undefined,
  artifactId: string,
  counts: { todos: number; reading: number },
) {
  const [state, setState] = useState<DigestInteractions>(() =>
    userId ? readDigestInteractions(userId, artifactId) : { todos: {}, reading: {}, keyPoints: {} },
  );

  useEffect(() => {
    if (!userId) return;
    setState(readDigestInteractions(userId, artifactId));
  }, [artifactId, userId]);

  useEffect(() => {
    if (!userId) return;
    writeDigestInteractions(userId, artifactId, state);
  }, [artifactId, state, userId]);

  const toggleTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: { ...prev.todos, [id]: !prev.todos[id] },
    }));
  }, []);

  const toggleReading = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      reading: { ...prev.reading, [id]: !prev.reading[id] },
    }));
  }, []);

  const toggleKeyPoint = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      keyPoints: { ...prev.keyPoints, [id]: !prev.keyPoints[id] },
    }));
  }, []);

  const isTodoDone = useCallback((id: string) => !!state.todos[id], [state.todos]);
  const isReadingDone = useCallback((id: string) => !!state.reading[id], [state.reading]);
  const isKeyPointDone = useCallback((id: string) => !!state.keyPoints[id], [state.keyPoints]);

  const todoDoneCount = useMemo(() => {
    let done = 0;
    for (let i = 0; i < counts.todos; i++) {
      if (state.todos[`todo-${i}`]) done++;
    }
    return done;
  }, [counts.todos, state.todos]);

  const readingDoneCount = useMemo(() => {
    let done = 0;
    for (let i = 0; i < counts.reading; i++) {
      if (state.reading[`reading-${i}`]) done++;
    }
    return done;
  }, [counts.reading, state.reading]);

  return {
    toggleTodo,
    toggleReading,
    toggleKeyPoint,
    isTodoDone,
    isReadingDone,
    isKeyPointDone,
    todoDoneCount,
    readingDoneCount,
    todoTotal: counts.todos,
    readingTotal: counts.reading,
  };
}

export type DigestInteractionsApi = ReturnType<typeof useDigestInteractions>;
