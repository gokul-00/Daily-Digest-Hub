/** @jsxImportSource theme-ui */
import { Link as RouterLink } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Box, Flex, Link, Text, ThemeUIProvider } from "theme-ui";

import { DigestBlocks, DigestBlocksProvider } from "@/components/digest/DigestBlocks";
import { digestToBlocks } from "@/lib/digest-to-blocks";
import type { DigestArtifact } from "@/lib/digest.shared";
import { formatAiUsageLine } from "@/lib/ai-usage";
import { laterTheme } from "@/lib/later-theme";
import { useAuth } from "@/hooks/use-auth";
import { useDigestInteractions } from "@/hooks/use-digest-interactions";

type DigestBlockPageProps = {
  artifact: DigestArtifact;
};

function DigestDocument({ artifact }: DigestBlockPageProps) {
  const { user } = useAuth();
  const blocks = useMemo(
    () =>
      digestToBlocks(artifact.digest, {
        title: artifact.title,
        createdAt: artifact.createdAt,
        dumpCount: artifact.dumpCount,
      }),
    [artifact],
  );

  const interactions = useDigestInteractions(user?.id, artifact.id, {
    todos: artifact.digest.todos.length,
    reading: artifact.digest.reading.length,
  });

  return (
    <ThemeUIProvider theme={laterTheme}>
      <Box
        sx={{
          minHeight: "100dvh",
          bg: "background",
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(184,74,58,0.05), transparent 50%), radial-gradient(circle at 90% 80%, rgba(138,111,85,0.08), transparent 55%)",
          py: [3, 4, 5],
          px: [2, 3, 4],
        }}
      >
        <Box sx={{ maxWidth: "container", mx: "auto" }}>
          <Flex
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              gap: 3,
              mb: 3,
              px: [1, 2],
            }}
          >
            <Box
              as={RouterLink}
              to="/"
              sx={{
                fontFamily: "monospace",
                fontSize: 0,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "secondary",
                textDecoration: "none",
                "&:hover": { color: "primary" },
              }}
            >
              ← Back to pile
            </Box>
            <Text
              sx={{
                fontFamily: "monospace",
                fontSize: 0,
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "secondary",
                textAlign: "right",
              }}
            >
              {interactions.todoTotal > 0 && (
                <>
                  {interactions.todoDoneCount}/{interactions.todoTotal} todos ·{" "}
                </>
              )}
              tap to check off
            </Text>
          </Flex>

          <Box
            sx={{
              bg: "page",
              borderRadius: "card",
              boxShadow: "page",
              border: "1px solid",
              borderColor: "border",
              px: [3, 4, 5],
              py: [4, 5, 6],
            }}
          >
            <DigestBlocksProvider interactions={interactions}>
              <DigestBlocks blocks={blocks} />
            </DigestBlocksProvider>
            <Flex
              sx={{
                mt: 6,
                pt: 4,
                borderTop: "1px solid",
                borderColor: "border",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Text
                sx={{
                  fontFamily: "monospace",
                  fontSize: 0,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "secondary",
                }}
              >
                — end of edition —
              </Text>
              <Flex sx={{ flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                {artifact.usage && (
                  <Text
                    sx={{
                      fontFamily: "monospace",
                      fontSize: 0,
                      letterSpacing: "0.06em",
                      color: "secondary",
                      textTransform: "none",
                    }}
                  >
                    {formatAiUsageLine(artifact.usage)} · {artifact.usage.dumpCount} items ·{" "}
                    {artifact.usage.urlCount} urls
                  </Text>
                )}
                <Text
                  sx={{
                    fontFamily: "monospace",
                    fontSize: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    color: "secondary",
                  }}
                >
                  Later.
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Box>
    </ThemeUIProvider>
  );
}

export function DigestBlockPage({ artifact }: DigestBlockPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          bg: "#f2ebe0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "monospace",
          fontSize: 1,
          color: "#6b6358",
        }}
      >
        Opening edition…
      </Box>
    );
  }

  return <DigestDocument artifact={artifact} />;
}
