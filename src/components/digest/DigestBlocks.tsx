/** @jsxImportSource theme-ui */
import { createContext, useContext } from "react";
import { Box, Flex, Link, Text } from "theme-ui";

import type { DigestInteractionsApi } from "@/hooks/use-digest-interactions";
import { keyPointBlockId } from "@/lib/digest-interactions";
import type { DigestBlock } from "@/lib/digest-to-blocks";

const DigestInteractionsContext = createContext<DigestInteractionsApi | null>(null);

function useDigestBlockInteractions() {
  const ctx = useContext(DigestInteractionsContext);
  if (!ctx) {
    throw new Error("DigestBlocks must be wrapped with DigestInteractionsContext");
  }
  return ctx;
}

export function DigestBlocksProvider({
  interactions,
  children,
}: {
  interactions: DigestInteractionsApi;
  children: React.ReactNode;
}) {
  return (
    <DigestInteractionsContext.Provider value={interactions}>
      {children}
    </DigestInteractionsContext.Provider>
  );
}

function BlockCheckbox({
  checked,
  onToggle,
  label,
  priority,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  priority?: "high" | "medium" | "low";
}) {
  const filled = priority === "high";
  const outlined = priority === "medium";

  return (
    <Box
      as="button"
      type="button"
      onClick={onToggle}
      aria-label={checked ? `Mark "${label}" as open` : `Mark "${label}" as done`}
      aria-pressed={checked}
      sx={{
        flex: "none",
        width: "22px",
        height: "22px",
        mt: "2px",
        display: "grid",
        placeItems: "center",
        border: "2px solid",
        borderColor: checked ? "primary" : filled || outlined ? "primary" : "border",
        bg: checked || filled ? "primary" : "transparent",
        borderRadius: "2px",
        cursor: "pointer",
        color: checked || filled ? "page" : "transparent",
        fontFamily: "monospace",
        fontSize: "11px",
        lineHeight: 1,
        transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
        "&:hover": {
          borderColor: "primary",
          bg: checked || filled ? "primary" : "blockHover",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary",
          outlineOffset: "2px",
        },
      }}
    >
      {checked ? "✓" : ""}
    </Box>
  );
}

function BlockRow({
  icon,
  children,
  muted,
}: {
  icon?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Flex
      sx={{
        position: "relative",
        gap: 2,
        px: [2, 3],
        py: 2,
        mx: [-2, -3],
        borderRadius: "card",
        opacity: muted ? 0.62 : 1,
        transition: "background 120ms ease, opacity 160ms ease",
        "&:hover": { bg: "blockHover" },
        "&:hover .block-gutter": { opacity: 1 },
      }}
    >
      <Text
        className="block-gutter"
        sx={{
          flex: "none",
          width: "gutter",
          fontFamily: "monospace",
          fontSize: 0,
          color: "gutter",
          opacity: muted ? 0.35 : 0,
          transition: "opacity 120ms ease",
          userSelect: "none",
          pt: "2px",
        }}
      >
        {icon ?? "⋮⋮"}
      </Text>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Flex>
  );
}

function TagPills({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <Flex sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}>
      {tags.map((tag) => (
        <Text
          key={tag}
          as="span"
          sx={{
            fontFamily: "monospace",
            fontSize: 0,
            color: "muted",
            bg: "background",
            border: "1px solid",
            borderColor: "border",
            borderRadius: "default",
            px: 2,
            py: "2px",
          }}
        >
          #{tag}
        </Text>
      ))}
    </Flex>
  );
}

function SectionProgress({ block }: { block: Extract<DigestBlock, { type: "section" }> }) {
  const { todoDoneCount, todoTotal, readingDoneCount, readingTotal } = useDigestBlockInteractions();

  if (block.sectionKey === "todos" && todoTotal > 0) {
    return (
      <Text
        sx={{
          fontFamily: "monospace",
          fontSize: 0,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: todoDoneCount === todoTotal ? "primary" : "secondary",
        }}
      >
        {todoDoneCount}/{todoTotal} done
      </Text>
    );
  }

  if (block.sectionKey === "reading" && readingTotal > 0) {
    return (
      <Text
        sx={{
          fontFamily: "monospace",
          fontSize: 0,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: readingDoneCount === readingTotal ? "primary" : "secondary",
        }}
      >
        {readingDoneCount}/{readingTotal} read
      </Text>
    );
  }

  return (
    <Text
      sx={{
        fontFamily: "monospace",
        fontSize: 0,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color: "secondary",
      }}
    >
      {block.count.toString().padStart(2, "0")}
    </Text>
  );
}

function BlockContent({ block }: { block: DigestBlock }) {
  const interactions = useDigestBlockInteractions();

  switch (block.type) {
    case "page_title":
      return (
        <Box sx={{ pb: 4, borderBottom: "1px solid", borderColor: "border" }}>
          <Text
            sx={{
              fontFamily: "monospace",
              fontSize: 0,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "secondary",
            }}
          >
            Evening edition · {block.itemCount} items
          </Text>
          <Text
            as="h1"
            sx={{
              fontFamily: "heading",
              fontSize: [5, 6],
              fontWeight: "heading",
              lineHeight: "heading",
              mt: 2,
              color: "text",
            }}
          >
            {block.title}
          </Text>
          <Text sx={{ fontFamily: "monospace", fontSize: 0, color: "muted", mt: 2 }}>
            {block.meta}
          </Text>
        </Box>
      );

    case "callout":
      return (
        <BlockRow icon="◆">
          <Box
            sx={{
              bg: "callout",
              borderLeft: "3px solid",
              borderColor: "calloutBorder",
              borderRadius: "card",
              px: 3,
              py: 3,
              boxShadow: "block",
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
              {block.label}
            </Text>
            <Text
              sx={{
                fontFamily: "heading",
                fontSize: 4,
                lineHeight: "tight",
                mt: 2,
                color: "text",
              }}
            >
              {block.text}
            </Text>
          </Box>
        </BlockRow>
      );

    case "tags":
      return (
        <BlockRow icon="#">
          <Text
            sx={{
              fontFamily: "monospace",
              fontSize: 0,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "secondary",
              mb: 2,
            }}
          >
            {block.label}
          </Text>
          <Flex sx={{ flexWrap: "wrap", gap: 2 }}>
            {block.items.map((item) => (
              <Text
                key={item}
                as="span"
                sx={{
                  fontFamily: "monospace",
                  fontSize: 1,
                  color: "muted",
                  bg: "background",
                  border: "1px solid",
                  borderColor: "border",
                  borderRadius: "pill",
                  px: 3,
                  py: 1,
                }}
              >
                {item}
              </Text>
            ))}
          </Flex>
        </BlockRow>
      );

    case "section":
      return (
        <Flex
          sx={{
            alignItems: "baseline",
            justifyContent: "space-between",
            pt: 5,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "border",
          }}
        >
          <Text
            as="h2"
            sx={{
              fontFamily: "heading",
              fontSize: 4,
              fontWeight: "heading",
              color: "text",
            }}
          >
            <Text as="span" sx={{ color: "primary", mr: 2 }}>
              {block.icon}
            </Text>
            {block.label}
          </Text>
          <SectionProgress block={block} />
        </Flex>
      );

    case "reading": {
      const { item, index, blockId } = block;
      const readingIndex = index - 1;
      const done = interactions.isReadingDone(blockId);

      return (
        <BlockRow icon={index.toString().padStart(2, "0")} muted={done}>
          <Flex sx={{ gap: 3 }}>
            <BlockCheckbox
              checked={done}
              onToggle={() => interactions.toggleReading(blockId)}
              label={item.title}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Flex sx={{ flexWrap: "wrap", alignItems: "baseline", gap: 2 }}>
                <Text
                  as="h3"
                  sx={{
                    fontFamily: "heading",
                    fontSize: 3,
                    fontWeight: "heading",
                    lineHeight: "tight",
                    color: done ? "muted" : "text",
                    textDecoration: done ? "line-through" : "none",
                  }}
                >
                  {item.title}
                </Text>
                {!done && (
                  <>
                    <Text
                      sx={{
                        fontFamily: "monospace",
                        fontSize: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                        color: "secondary",
                      }}
                    >
                      {item.category}
                    </Text>
                    {item.worthDeepDive && (
                      <Text
                        sx={{
                          fontFamily: "monospace",
                          fontSize: 0,
                          textTransform: "uppercase",
                          letterSpacing: "0.16em",
                          color: "primary",
                        }}
                      >
                        ★ deep dive
                      </Text>
                    )}
                  </>
                )}
              </Flex>
              {!done && (
                <>
                  <Text sx={{ fontSize: 2, lineHeight: "body", color: "muted", mt: 2 }}>
                    {item.tldr}
                  </Text>
                  {item.keyPoints.length > 0 && (
                    <Box as="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 2 }}>
                      {item.keyPoints.map((point, pointIndex) => {
                        const kpId = keyPointBlockId(readingIndex, pointIndex);
                        const kpDone = interactions.isKeyPointDone(kpId);
                        return (
                          <Flex
                            as="li"
                            key={point}
                            sx={{
                              gap: 2,
                              fontSize: 2,
                              lineHeight: "body",
                              color: kpDone ? "muted" : "text",
                              py: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            <BlockCheckbox
                              checked={kpDone}
                              onToggle={() => interactions.toggleKeyPoint(kpId)}
                              label={point}
                            />
                            <Text
                              sx={{
                                flex: 1,
                                textDecoration: kpDone ? "line-through" : "none",
                                pt: "2px",
                              }}
                            >
                              {point}
                            </Text>
                          </Flex>
                        );
                      })}
                    </Box>
                  )}
                  <TagPills tags={item.tags} />
                  {item.sources.length > 0 && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "border" }}>
                      {item.sources.map((source) => {
                        const isUrl = source.url && /^https?:\/\//.test(source.url);
                        return (
                          <Text
                            key={`${source.url}-${source.label}`}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: 0,
                              color: "muted",
                              display: "block",
                              py: 1,
                              wordBreak: "break-all",
                            }}
                          >
                            <Text as="span" sx={{ color: "secondary" }}>
                              ↗{" "}
                            </Text>
                            {isUrl ? (
                              <Link
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ color: "muted", "&:hover": { color: "primary" } }}
                              >
                                {source.label || source.url}
                              </Link>
                            ) : (
                              source.label || "user note"
                            )}
                          </Text>
                        );
                      })}
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Flex>
        </BlockRow>
      );
    }

    case "todo": {
      const { item, blockId } = block;
      const done = interactions.isTodoDone(blockId);

      return (
        <BlockRow icon={done ? "✓" : "☐"} muted={done}>
          <Flex sx={{ gap: 3 }}>
            <BlockCheckbox
              checked={done}
              onToggle={() => interactions.toggleTodo(blockId)}
              label={item.task}
              priority={item.priority}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Text
                sx={{
                  fontFamily: "heading",
                  fontSize: 3,
                  lineHeight: "tight",
                  color: done ? "muted" : "text",
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {item.task}
              </Text>
              {!done && item.context && (
                <Text sx={{ fontSize: 1, color: "muted", mt: 1 }}>
                  {item.context}
                </Text>
              )}
              {!done && (
                <Text
                  sx={{
                    fontFamily: "monospace",
                    fontSize: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "secondary",
                    mt: 2,
                  }}
                >
                  when · {item.when} · {item.priority}
                </Text>
              )}
              {!done && <TagPills tags={item.tags} />}
            </Box>
          </Flex>
        </BlockRow>
      );
    }

    case "idea": {
      const { item } = block;
      return (
        <BlockRow icon="✺">
          <Box
            sx={{
              borderLeft: "2px solid",
              borderColor: "ideaBorder",
              pl: 3,
            }}
          >
            <Text
              as="h3"
              sx={{
                fontFamily: "heading",
                fontSize: 3,
                fontWeight: "heading",
                lineHeight: "tight",
                color: "text",
              }}
            >
              {item.title}
            </Text>
            <Text
              sx={{
                fontFamily: "heading",
                fontSize: 2,
                fontStyle: "italic",
                color: "muted",
                mt: 2,
              }}
            >
              &ldquo;{item.seed}&rdquo;
            </Text>
            <Text sx={{ fontSize: 2, lineHeight: "body", color: "text", mt: 2 }}>
              {item.expand}
            </Text>
            <TagPills tags={item.tags} />
          </Box>
        </BlockRow>
      );
    }

    case "note": {
      const { item } = block;
      return (
        <BlockRow icon="•">
          <Box sx={{ pb: 2, borderBottom: "1px solid", borderColor: "border" }}>
            <Text
              as="h3"
              sx={{
                fontFamily: "heading",
                fontSize: 3,
                fontWeight: "heading",
                color: "text",
              }}
            >
              {item.title}
            </Text>
            <Text sx={{ fontSize: 2, lineHeight: "body", color: "muted", mt: 2 }}>
              {item.body}
            </Text>
            <TagPills tags={item.tags} />
          </Box>
        </BlockRow>
      );
    }

    case "divider":
      return (
        <Box
          sx={{
            height: "1px",
            bg: "border",
            my: 4,
            opacity: 0.7,
          }}
        />
      );

    default:
      return null;
  }
}

export function DigestBlocks({ blocks }: { blocks: DigestBlock[] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {blocks.map((block, index) => (
        <BlockContent key={`${block.type}-${"blockId" in block ? block.blockId : index}`} block={block} />
      ))}
    </Box>
  );
}
