import { o as __toESM } from "../_runtime.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as readLocalArtifacts } from "./digest.shared-DcEcIIgD.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@emotion/react+[...].mjs";
import { i as useServerFn, r as useAuth, t as getArtifact } from "./digest-artifacts.functions-BrxI9ziH.mjs";
import { t as Route } from "./digest._id-C6oYk2L7.mjs";
import { n as require_theme_ui_cjs, t as require_theme_ui_jsx_runtime_cjs } from "../_libs/theme-ui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/digest._id-R1dLTN9C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_theme_ui_cjs = require_theme_ui_cjs();
var import_theme_ui_jsx_runtime_cjs = require_theme_ui_jsx_runtime_cjs();
var DIGEST_INTERACTIONS_KEY = "later.digest-interactions.v1";
function storageKey(userId, artifactId) {
	return `${DIGEST_INTERACTIONS_KEY}.${userId}.${artifactId}`;
}
var emptyInteractions = () => ({
	todos: {},
	reading: {},
	keyPoints: {}
});
function readDigestInteractions(userId, artifactId) {
	if (typeof window === "undefined") return emptyInteractions();
	try {
		const raw = window.localStorage.getItem(storageKey(userId, artifactId));
		if (!raw) return emptyInteractions();
		const parsed = JSON.parse(raw);
		return {
			todos: parsed.todos ?? {},
			reading: parsed.reading ?? {},
			keyPoints: parsed.keyPoints ?? {}
		};
	} catch {
		return emptyInteractions();
	}
}
function writeDigestInteractions(userId, artifactId, state) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(storageKey(userId, artifactId), JSON.stringify(state));
}
function todoBlockId(index) {
	return `todo-${index}`;
}
function readingBlockId(index) {
	return `reading-${index}`;
}
function keyPointBlockId(readingIndex, pointIndex) {
	return `reading-${readingIndex}-kp-${pointIndex}`;
}
/** @jsxImportSource theme-ui */
var DigestInteractionsContext = (0, import_react.createContext)(null);
function useDigestBlockInteractions() {
	const ctx = (0, import_react.useContext)(DigestInteractionsContext);
	if (!ctx) throw new Error("DigestBlocks must be wrapped with DigestInteractionsContext");
	return ctx;
}
function DigestBlocksProvider({ interactions, children }) {
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(DigestInteractionsContext.Provider, {
		value: interactions,
		children
	});
}
function BlockCheckbox({ checked, onToggle, label, priority }) {
	const filled = priority === "high";
	const outlined = priority === "medium";
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
		as: "button",
		type: "button",
		onClick: onToggle,
		"aria-label": checked ? `Mark "${label}" as open` : `Mark "${label}" as done`,
		"aria-pressed": checked,
		sx: {
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
				bg: checked || filled ? "primary" : "blockHover"
			},
			"&:focus-visible": {
				outline: "2px solid",
				outlineColor: "primary",
				outlineOffset: "2px"
			}
		},
		children: checked ? "✓" : ""
	});
}
function BlockRow({ icon, children, muted }) {
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
		sx: {
			position: "relative",
			gap: 2,
			px: [2, 3],
			py: 2,
			mx: [-2, -3],
			borderRadius: "card",
			opacity: muted ? .62 : 1,
			transition: "background 120ms ease, opacity 160ms ease",
			"&:hover": { bg: "blockHover" },
			"&:hover .block-gutter": { opacity: 1 }
		},
		children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
			className: "block-gutter",
			sx: {
				flex: "none",
				width: "gutter",
				fontFamily: "monospace",
				fontSize: 0,
				color: "gutter",
				opacity: muted ? .35 : 0,
				transition: "opacity 120ms ease",
				userSelect: "none",
				pt: "2px"
			},
			children: icon ?? "⋮⋮"
		}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
			sx: {
				flex: 1,
				minWidth: 0
			},
			children
		})]
	});
}
function TagPills({ tags }) {
	if (!tags.length) return null;
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Flex, {
		sx: {
			flexWrap: "wrap",
			gap: 1,
			mt: 2
		},
		children: tags.map((tag) => /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
			as: "span",
			sx: {
				fontFamily: "monospace",
				fontSize: 0,
				color: "muted",
				bg: "background",
				border: "1px solid",
				borderColor: "border",
				borderRadius: "default",
				px: 2,
				py: "2px"
			},
			children: ["#", tag]
		}, tag))
	});
}
function SectionProgress({ block }) {
	const { todoDoneCount, todoTotal, readingDoneCount, readingTotal } = useDigestBlockInteractions();
	if (block.sectionKey === "todos" && todoTotal > 0) return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
		sx: {
			fontFamily: "monospace",
			fontSize: 0,
			textTransform: "uppercase",
			letterSpacing: "0.2em",
			color: todoDoneCount === todoTotal ? "primary" : "secondary"
		},
		children: [
			todoDoneCount,
			"/",
			todoTotal,
			" done"
		]
	});
	if (block.sectionKey === "reading" && readingTotal > 0) return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
		sx: {
			fontFamily: "monospace",
			fontSize: 0,
			textTransform: "uppercase",
			letterSpacing: "0.2em",
			color: readingDoneCount === readingTotal ? "primary" : "secondary"
		},
		children: [
			readingDoneCount,
			"/",
			readingTotal,
			" read"
		]
	});
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
		sx: {
			fontFamily: "monospace",
			fontSize: 0,
			textTransform: "uppercase",
			letterSpacing: "0.2em",
			color: "secondary"
		},
		children: block.count.toString().padStart(2, "0")
	});
}
function BlockContent({ block }) {
	const interactions = useDigestBlockInteractions();
	switch (block.type) {
		case "page_title": return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
			sx: {
				pb: 4,
				borderBottom: "1px solid",
				borderColor: "border"
			},
			children: [
				/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
					sx: {
						fontFamily: "monospace",
						fontSize: 0,
						textTransform: "uppercase",
						letterSpacing: "0.2em",
						color: "secondary"
					},
					children: [
						"Evening edition · ",
						block.itemCount,
						" items"
					]
				}),
				/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					as: "h1",
					sx: {
						fontFamily: "heading",
						fontSize: [5, 6],
						fontWeight: "heading",
						lineHeight: "heading",
						mt: 2,
						color: "text"
					},
					children: block.title
				}),
				/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					sx: {
						fontFamily: "monospace",
						fontSize: 0,
						color: "muted",
						mt: 2
					},
					children: block.meta
				})
			]
		});
		case "callout": return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockRow, {
			icon: "◆",
			children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
				sx: {
					bg: "callout",
					borderLeft: "3px solid",
					borderColor: "calloutBorder",
					borderRadius: "card",
					px: 3,
					py: 3,
					boxShadow: "block"
				},
				children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					sx: {
						fontFamily: "monospace",
						fontSize: 0,
						textTransform: "uppercase",
						letterSpacing: "0.18em",
						color: "secondary"
					},
					children: block.label
				}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					sx: {
						fontFamily: "heading",
						fontSize: 4,
						lineHeight: "tight",
						mt: 2,
						color: "text"
					},
					children: block.text
				})]
			})
		});
		case "tags": return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(BlockRow, {
			icon: "#",
			children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
				sx: {
					fontFamily: "monospace",
					fontSize: 0,
					textTransform: "uppercase",
					letterSpacing: "0.18em",
					color: "secondary",
					mb: 2
				},
				children: block.label
			}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Flex, {
				sx: {
					flexWrap: "wrap",
					gap: 2
				},
				children: block.items.map((item) => /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					as: "span",
					sx: {
						fontFamily: "monospace",
						fontSize: 1,
						color: "muted",
						bg: "background",
						border: "1px solid",
						borderColor: "border",
						borderRadius: "pill",
						px: 3,
						py: 1
					},
					children: item
				}, item))
			})]
		});
		case "section": return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
			sx: {
				alignItems: "baseline",
				justifyContent: "space-between",
				pt: 5,
				pb: 2,
				borderBottom: "1px solid",
				borderColor: "border"
			},
			children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
				as: "h2",
				sx: {
					fontFamily: "heading",
					fontSize: 4,
					fontWeight: "heading",
					color: "text"
				},
				children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
					as: "span",
					sx: {
						color: "primary",
						mr: 2
					},
					children: block.icon
				}), block.label]
			}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(SectionProgress, { block })]
		});
		case "reading": {
			const { item, index, blockId } = block;
			const readingIndex = index - 1;
			const done = interactions.isReadingDone(blockId);
			return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockRow, {
				icon: index.toString().padStart(2, "0"),
				muted: done,
				children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
					sx: { gap: 3 },
					children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockCheckbox, {
						checked: done,
						onToggle: () => interactions.toggleReading(blockId),
						label: item.title
					}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
						sx: {
							flex: 1,
							minWidth: 0
						},
						children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
							sx: {
								flexWrap: "wrap",
								alignItems: "baseline",
								gap: 2
							},
							children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								as: "h3",
								sx: {
									fontFamily: "heading",
									fontSize: 3,
									fontWeight: "heading",
									lineHeight: "tight",
									color: done ? "muted" : "text",
									textDecoration: done ? "line-through" : "none"
								},
								children: item.title
							}), !done && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_jsx_runtime_cjs.Fragment, { children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								sx: {
									fontFamily: "monospace",
									fontSize: 0,
									textTransform: "uppercase",
									letterSpacing: "0.16em",
									color: "secondary"
								},
								children: item.category
							}), item.worthDeepDive && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								sx: {
									fontFamily: "monospace",
									fontSize: 0,
									textTransform: "uppercase",
									letterSpacing: "0.16em",
									color: "primary"
								},
								children: "★ deep dive"
							})] })]
						}), !done && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_jsx_runtime_cjs.Fragment, { children: [
							/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								sx: {
									fontSize: 2,
									lineHeight: "body",
									color: "muted",
									mt: 2
								},
								children: item.tldr
							}),
							item.keyPoints.length > 0 && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
								as: "ul",
								sx: {
									listStyle: "none",
									m: 0,
									p: 0,
									mt: 2
								},
								children: item.keyPoints.map((point, pointIndex) => {
									const kpId = keyPointBlockId(readingIndex, pointIndex);
									const kpDone = interactions.isKeyPointDone(kpId);
									return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
										as: "li",
										sx: {
											gap: 2,
											fontSize: 2,
											lineHeight: "body",
											color: kpDone ? "muted" : "text",
											py: 1,
											alignItems: "flex-start"
										},
										children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockCheckbox, {
											checked: kpDone,
											onToggle: () => interactions.toggleKeyPoint(kpId),
											label: point
										}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
											sx: {
												flex: 1,
												textDecoration: kpDone ? "line-through" : "none",
												pt: "2px"
											},
											children: point
										})]
									}, point);
								})
							}),
							/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(TagPills, { tags: item.tags }),
							item.sources.length > 0 && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
								sx: {
									mt: 3,
									pt: 2,
									borderTop: "1px solid",
									borderColor: "border"
								},
								children: item.sources.map((source) => {
									const isUrl = source.url && /^https?:\/\//.test(source.url);
									return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
										sx: {
											fontFamily: "monospace",
											fontSize: 0,
											color: "muted",
											display: "block",
											py: 1,
											wordBreak: "break-all"
										},
										children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
											as: "span",
											sx: { color: "secondary" },
											children: ["↗", " "]
										}), isUrl ? /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Link, {
											href: source.url,
											target: "_blank",
											rel: "noreferrer",
											sx: {
												color: "muted",
												"&:hover": { color: "primary" }
											},
											children: source.label || source.url
										}) : source.label || "user note"]
									}, `${source.url}-${source.label}`);
								})
							})
						] })]
					})]
				})
			});
		}
		case "todo": {
			const { item, blockId } = block;
			const done = interactions.isTodoDone(blockId);
			return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockRow, {
				icon: done ? "✓" : "☐",
				muted: done,
				children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
					sx: { gap: 3 },
					children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockCheckbox, {
						checked: done,
						onToggle: () => interactions.toggleTodo(blockId),
						label: item.task,
						priority: item.priority
					}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
						sx: {
							flex: 1,
							minWidth: 0
						},
						children: [
							/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								sx: {
									fontFamily: "heading",
									fontSize: 3,
									lineHeight: "tight",
									color: done ? "muted" : "text",
									textDecoration: done ? "line-through" : "none"
								},
								children: item.task
							}),
							!done && item.context && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
								sx: {
									fontSize: 1,
									color: "muted",
									mt: 1
								},
								children: item.context
							}),
							!done && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
								sx: {
									fontFamily: "monospace",
									fontSize: 0,
									textTransform: "uppercase",
									letterSpacing: "0.16em",
									color: "secondary",
									mt: 2
								},
								children: [
									"when · ",
									item.when,
									" · ",
									item.priority
								]
							}),
							!done && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(TagPills, { tags: item.tags })
						]
					})]
				})
			});
		}
		case "idea": {
			const { item } = block;
			return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockRow, {
				icon: "✺",
				children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
					sx: {
						borderLeft: "2px solid",
						borderColor: "ideaBorder",
						pl: 3
					},
					children: [
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							as: "h3",
							sx: {
								fontFamily: "heading",
								fontSize: 3,
								fontWeight: "heading",
								lineHeight: "tight",
								color: "text"
							},
							children: item.title
						}),
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
							sx: {
								fontFamily: "heading",
								fontSize: 2,
								fontStyle: "italic",
								color: "muted",
								mt: 2
							},
							children: [
								"“",
								item.seed,
								"”"
							]
						}),
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							sx: {
								fontSize: 2,
								lineHeight: "body",
								color: "text",
								mt: 2
							},
							children: item.expand
						}),
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(TagPills, { tags: item.tags })
					]
				})
			});
		}
		case "note": {
			const { item } = block;
			return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockRow, {
				icon: "•",
				children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
					sx: {
						pb: 2,
						borderBottom: "1px solid",
						borderColor: "border"
					},
					children: [
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							as: "h3",
							sx: {
								fontFamily: "heading",
								fontSize: 3,
								fontWeight: "heading",
								color: "text"
							},
							children: item.title
						}),
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							sx: {
								fontSize: 2,
								lineHeight: "body",
								color: "muted",
								mt: 2
							},
							children: item.body
						}),
						/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(TagPills, { tags: item.tags })
					]
				})
			});
		}
		case "divider": return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, { sx: {
			height: "1px",
			bg: "border",
			my: 4,
			opacity: .7
		} });
		default: return null;
	}
}
function DigestBlocks({ blocks }) {
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
		sx: {
			display: "flex",
			flexDirection: "column",
			gap: 0
		},
		children: blocks.map((block, index) => /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(BlockContent, { block }, `${block.type}-${"blockId" in block ? block.blockId : index}`))
	});
}
function digestToBlocks(digest, meta) {
	const blocks = [{
		type: "page_title",
		title: meta.title,
		meta: new Date(meta.createdAt).toLocaleString(void 0, {
			weekday: "long",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit"
		}),
		itemCount: meta.dumpCount
	}, {
		type: "callout",
		label: "The gist",
		text: digest.overview
	}];
	if (digest.themes.length > 0) blocks.push({
		type: "tags",
		label: "Themes",
		items: digest.themes
	});
	if (digest.reading.length > 0) {
		blocks.push({
			type: "section",
			icon: "¶",
			label: "Reading",
			count: digest.reading.length,
			sectionKey: "reading"
		});
		digest.reading.forEach((item, index) => {
			blocks.push({
				type: "reading",
				blockId: readingBlockId(index),
				index: index + 1,
				item
			});
		});
	}
	if (digest.todos.length > 0) {
		blocks.push({ type: "divider" });
		blocks.push({
			type: "section",
			icon: "✓",
			label: "Todos",
			count: digest.todos.length,
			sectionKey: "todos"
		});
		digest.todos.forEach((item, index) => {
			blocks.push({
				type: "todo",
				blockId: todoBlockId(index),
				item
			});
		});
	}
	if (digest.ideas.length > 0) {
		blocks.push({ type: "divider" });
		blocks.push({
			type: "section",
			icon: "✺",
			label: "Ideas to explore",
			count: digest.ideas.length
		});
		digest.ideas.forEach((item) => blocks.push({
			type: "idea",
			item
		}));
	}
	if (digest.notes.length > 0) {
		blocks.push({ type: "divider" });
		blocks.push({
			type: "section",
			icon: "•",
			label: "Notes",
			count: digest.notes.length
		});
		digest.notes.forEach((item) => blocks.push({
			type: "note",
			item
		}));
	}
	return blocks;
}
/** Theme UI theme aligned with Later.'s paper + ink palette. */
var laterTheme = {
	config: {
		useRootStyles: false,
		useBorderBox: true
	},
	fonts: {
		body: "\"Inter\", ui-sans-serif, system-ui, sans-serif",
		heading: "\"Fraunces\", ui-serif, Georgia, serif",
		monospace: "\"JetBrains Mono\", ui-monospace, monospace"
	},
	colors: {
		text: "#3a342c",
		background: "#f2ebe0",
		primary: "#b84a3a",
		secondary: "#8a6f55",
		muted: "#6b6358",
		accent: "#b84a3a",
		card: "#faf6ef",
		border: "#d9cfc0",
		blockHover: "rgba(184, 74, 58, 0.07)",
		callout: "#f7f2ea",
		calloutBorder: "#b84a3a",
		ideaBorder: "#8a6f55",
		page: "#faf6ef",
		gutter: "#c4b8a8"
	},
	space: [
		0,
		4,
		8,
		12,
		16,
		20,
		24,
		32,
		40,
		48,
		64,
		96
	],
	fontSizes: [
		11,
		12,
		13,
		14,
		16,
		18,
		20,
		24,
		28,
		36,
		48
	],
	fontWeights: {
		body: 400,
		heading: 500,
		bold: 600
	},
	lineHeights: {
		body: 1.65,
		heading: 1.25,
		tight: 1.35
	},
	radii: {
		default: 6,
		card: 10,
		pill: 9999
	},
	shadows: {
		page: "0 1px 0 rgba(58, 52, 44, 0.05), 0 20px 50px -24px rgba(58, 52, 44, 0.28)",
		block: "0 0 0 1px rgba(217, 207, 192, 0.8)"
	},
	sizes: {
		container: "720px",
		gutter: "28px"
	},
	text: { heading: {
		fontFamily: "heading",
		fontWeight: "heading",
		lineHeight: "heading",
		color: "text"
	} },
	styles: { root: {
		fontFamily: "body",
		fontSize: 2,
		lineHeight: "body",
		color: "text"
	} }
};
function useDigestInteractions(userId, artifactId, counts) {
	const [state, setState] = (0, import_react.useState)(() => userId ? readDigestInteractions(userId, artifactId) : {
		todos: {},
		reading: {},
		keyPoints: {}
	});
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		setState(readDigestInteractions(userId, artifactId));
	}, [artifactId, userId]);
	(0, import_react.useEffect)(() => {
		if (!userId) return;
		writeDigestInteractions(userId, artifactId, state);
	}, [
		artifactId,
		state,
		userId
	]);
	return {
		toggleTodo: (0, import_react.useCallback)((id) => {
			setState((prev) => ({
				...prev,
				todos: {
					...prev.todos,
					[id]: !prev.todos[id]
				}
			}));
		}, []),
		toggleReading: (0, import_react.useCallback)((id) => {
			setState((prev) => ({
				...prev,
				reading: {
					...prev.reading,
					[id]: !prev.reading[id]
				}
			}));
		}, []),
		toggleKeyPoint: (0, import_react.useCallback)((id) => {
			setState((prev) => ({
				...prev,
				keyPoints: {
					...prev.keyPoints,
					[id]: !prev.keyPoints[id]
				}
			}));
		}, []),
		isTodoDone: (0, import_react.useCallback)((id) => !!state.todos[id], [state.todos]),
		isReadingDone: (0, import_react.useCallback)((id) => !!state.reading[id], [state.reading]),
		isKeyPointDone: (0, import_react.useCallback)((id) => !!state.keyPoints[id], [state.keyPoints]),
		todoDoneCount: (0, import_react.useMemo)(() => {
			let done = 0;
			for (let i = 0; i < counts.todos; i++) if (state.todos[`todo-${i}`]) done++;
			return done;
		}, [counts.todos, state.todos]),
		readingDoneCount: (0, import_react.useMemo)(() => {
			let done = 0;
			for (let i = 0; i < counts.reading; i++) if (state.reading[`reading-${i}`]) done++;
			return done;
		}, [counts.reading, state.reading]),
		todoTotal: counts.todos,
		readingTotal: counts.reading
	};
}
/** @jsxImportSource theme-ui */
function DigestDocument({ artifact }) {
	const { user } = useAuth();
	const blocks = (0, import_react.useMemo)(() => digestToBlocks(artifact.digest, {
		title: artifact.title,
		createdAt: artifact.createdAt,
		dumpCount: artifact.dumpCount
	}), [artifact]);
	const interactions = useDigestInteractions(user?.id, artifact.id, {
		todos: artifact.digest.todos.length,
		reading: artifact.digest.reading.length
	});
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.ThemeUIProvider, {
		theme: laterTheme,
		children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
			sx: {
				minHeight: "100dvh",
				bg: "background",
				backgroundImage: "radial-gradient(circle at 20% 10%, rgba(184,74,58,0.05), transparent 50%), radial-gradient(circle at 90% 80%, rgba(138,111,85,0.08), transparent 55%)",
				py: [
					3,
					4,
					5
				],
				px: [
					2,
					3,
					4
				]
			},
			children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
				sx: {
					maxWidth: "container",
					mx: "auto"
				},
				children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
					sx: {
						alignItems: "center",
						justifyContent: "space-between",
						gap: 3,
						mb: 3,
						px: [1, 2]
					},
					children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
						as: Link,
						to: "/",
						sx: {
							fontFamily: "monospace",
							fontSize: 0,
							textTransform: "uppercase",
							letterSpacing: "0.18em",
							color: "secondary",
							textDecoration: "none",
							"&:hover": { color: "primary" }
						},
						children: "← Back to pile"
					}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Text, {
						sx: {
							fontFamily: "monospace",
							fontSize: 0,
							textTransform: "uppercase",
							letterSpacing: "0.18em",
							color: "secondary",
							textAlign: "right"
						},
						children: [interactions.todoTotal > 0 && /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_jsx_runtime_cjs.Fragment, { children: [
							interactions.todoDoneCount,
							"/",
							interactions.todoTotal,
							" todos ·",
							" "
						] }), "tap to check off"]
					})]
				}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Box, {
					sx: {
						bg: "page",
						borderRadius: "card",
						boxShadow: "page",
						border: "1px solid",
						borderColor: "border",
						px: [
							3,
							4,
							5
						],
						py: [
							4,
							5,
							6
						]
					},
					children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(DigestBlocksProvider, {
						interactions,
						children: /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(DigestBlocks, { blocks })
					}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsxs)(import_theme_ui_cjs.Flex, {
						sx: {
							mt: 6,
							pt: 4,
							borderTop: "1px solid",
							borderColor: "border",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 2
						},
						children: [/* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							sx: {
								fontFamily: "monospace",
								fontSize: 0,
								textTransform: "uppercase",
								letterSpacing: "0.18em",
								color: "secondary"
							},
							children: "— end of edition —"
						}), /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Text, {
							sx: {
								fontFamily: "monospace",
								fontSize: 0,
								textTransform: "uppercase",
								letterSpacing: "0.18em",
								color: "secondary"
							},
							children: "Later."
						})]
					})]
				})]
			})
		})
	});
}
function DigestBlockPage({ artifact }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	if (!mounted) return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(import_theme_ui_cjs.Box, {
		sx: {
			minHeight: "100dvh",
			bg: "#f2ebe0",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontFamily: "monospace",
			fontSize: 1,
			color: "#6b6358"
		},
		children: "Opening edition…"
	});
	return /* @__PURE__ */ (0, import_theme_ui_jsx_runtime_cjs.jsx)(DigestDocument, { artifact });
}
function DigestEditionPage() {
	const { id } = Route.useParams();
	const { user } = useAuth();
	const fetchOne = useServerFn(getArtifact);
	const [artifact, setArtifact] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function load() {
			if (!user?.id) return;
			setLoading(true);
			setError(null);
			try {
				const local = readLocalArtifacts(user.id).find((entry) => entry.id === id);
				if (local) {
					if (!cancelled) setArtifact(local);
					return;
				}
				const remote = await fetchOne({ data: { id } });
				if (!cancelled) if (remote) setArtifact(remote);
				else setError("That edition could not be found.");
			} catch {
				if (!cancelled) setError("Could not load that edition.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [
		fetchOne,
		id,
		user?.id
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-[100dvh] items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs uppercase tracking-[0.2em] text-marginalia",
			children: "Opening edition…"
		})
	});
	if (error || !artifact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "safe-px flex min-h-[100dvh] items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "paper-card max-w-md rounded-lg p-8 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl text-ink",
					children: "Edition not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: error ?? "This brief may have been removed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-accent",
					children: "Back to pile"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DigestBlockPage, { artifact });
}
//#endregion
export { DigestEditionPage as component };
