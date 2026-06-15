import { n as __esmMin, o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { c as require_react, n as import_emotion_react_cjs, r as init_emotion_react_cjs } from "./@emotion/react+[...].mjs";
import { i as require_theme_ui_core_jsx_runtime_cjs, o as require_theme_ui_css_cjs } from "./@theme-ui/color-modes+[...].mjs";
//#region node_modules/@theme-ui/components/dist/theme-ui-components.esm.js
var theme_ui_components_esm_exports = /* @__PURE__ */ __exportAll({
	Alert: () => Alert,
	AspectImage: () => AspectImage,
	AspectRatio: () => AspectRatio,
	Avatar: () => Avatar,
	Badge: () => Badge,
	Box: () => Box$1,
	Button: () => Button,
	Card: () => Card,
	Checkbox: () => Checkbox,
	Close: () => Close,
	CloseIcon: () => CloseIcon,
	Container: () => Container,
	Divider: () => Divider,
	Donut: () => Donut,
	Embed: () => Embed,
	Field: () => Field,
	Flex: () => Flex,
	Grid: () => Grid,
	Heading: () => Heading,
	IconButton: () => IconButton,
	Image: () => Image,
	Input: () => Input,
	Label: () => Label,
	Link: () => Link,
	MenuButton: () => MenuButton,
	MenuIcon: () => MenuIcon,
	Message: () => Message,
	NavLink: () => NavLink,
	Paragraph: () => Paragraph,
	Progress: () => Progress,
	Radio: () => Radio,
	Select: () => Select,
	Slider: () => Slider,
	Spinner: () => Spinner,
	Switch: () => Switch,
	Text: () => Text,
	Textarea: () => Textarea,
	__isBoxStyledSystemProp: () => __isBoxStyledSystemProp
});
/** @internal */
function __internalProps(props) {
	return props;
}
var import_react, import_theme_ui_css_cjs, import_theme_ui_core_jsx_runtime_cjs, boxSystemProps, __isBoxStyledSystemProp, pickSystemProps, Box$1, Flex, getProps, MRE, getMargin, omitMargin, px, singleWidthToColumns, widthToColumns, singleCountToColumns, countToColumns, Grid, Box, Button, Link, Paragraph, Text, Heading, Image, Card, Label, autofillStyles, defaultInputStyles, Input, SVG, DownArrow, Select, Textarea, RadioChecked, RadioUnchecked, RadioIcon, Radio, CheckboxChecked, CheckboxUnchecked, CheckboxIcon, Checkbox, GUTTER, SIZE, Switch, thumbStyle, sliderStyle, Slider, Field, Progress, Donut, Spinner, Avatar, Badge, IconButton, CloseIcon, Close, Alert, Divider, getContainerProps, getIframeProps, Embed, AspectRatio, AspectImage, Container, NavLink, Message, MenuIcon, MenuButton;
var init_theme_ui_components_esm = __esmMin((() => {
	init_emotion_react_cjs();
	import_react = /* @__PURE__ */ __toESM(require_react());
	import_theme_ui_css_cjs = require_theme_ui_css_cjs();
	import_theme_ui_core_jsx_runtime_cjs = require_theme_ui_core_jsx_runtime_cjs();
	boxSystemProps = [
		"margin",
		"marginTop",
		"marginRight",
		"marginBottom",
		"marginLeft",
		"marginX",
		"marginY",
		"m",
		"mt",
		"mr",
		"mb",
		"ml",
		"mx",
		"my",
		"padding",
		"paddingTop",
		"paddingRight",
		"paddingBottom",
		"paddingLeft",
		"paddingX",
		"paddingY",
		"p",
		"pt",
		"pr",
		"pb",
		"pl",
		"px",
		"py",
		"color",
		"backgroundColor",
		"bg",
		"opacity"
	];
	__isBoxStyledSystemProp = (prop) => boxSystemProps.includes(prop);
	pickSystemProps = (props) => {
		const res = {};
		for (const key of boxSystemProps) res[key] = props[key];
		return res;
	};
	Box$1 = /*#__PURE__*/ (0, import_react.forwardRef)(function Box(props, ref) {
		const theme = (0, import_emotion_react_cjs.useTheme)();
		const { __themeKey = "variants", __css, variant, css: cssProp, sx, as: Component = "div", ...rest } = props;
		const baseStyles = {
			boxSizing: "border-box",
			margin: 0,
			minWidth: 0
		};
		const __cssStyles = (0, import_theme_ui_css_cjs.css)(__css)(theme);
		const variantInTheme = (0, import_theme_ui_css_cjs.get)(theme, `${__themeKey}.${variant}`) || (0, import_theme_ui_css_cjs.get)(theme, variant);
		const style = [
			baseStyles,
			__cssStyles,
			variantInTheme && (0, import_theme_ui_css_cjs.css)(variantInTheme)(theme),
			(0, import_theme_ui_css_cjs.css)(sx)(theme),
			(0, import_theme_ui_css_cjs.css)(pickSystemProps(rest))(theme),
			cssProp
		];
		boxSystemProps.forEach((name) => {
			delete rest[name];
		});
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Component, {
			ref,
			css: style,
			...rest
		});
	});
	Flex = /*#__PURE__*/ import_react.forwardRef(function Flex(props, ref) {
		const { sx } = props;
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			...props,
			sx: (theme) => ({
				display: "flex",
				...typeof sx === "function" ? sx(theme) : sx
			})
		});
	});
	getProps = (test) => (props) => {
		const next = {};
		for (const key in props) if (test(key || "")) next[key] = props[key];
		return next;
	};
	MRE = /^m[trblxy]?$/;
	getMargin = getProps((k) => MRE.test(k));
	omitMargin = getProps((k) => !MRE.test(k));
	px = (n) => typeof n === "number" ? n + "px" : n;
	singleWidthToColumns = (width, repeat) => width ? `repeat(auto-${repeat}, minmax(${px(width)}, 1fr))` : null;
	widthToColumns = (width, repeat) => Array.isArray(width) ? width.map((w) => singleWidthToColumns(w, repeat)) : singleWidthToColumns(width, repeat);
	singleCountToColumns = (n) => n ? typeof n === "number" ? `repeat(${n}, 1fr)` : n : null;
	countToColumns = (n) => Array.isArray(n) ? n.map(singleCountToColumns) : singleCountToColumns(n);
	Grid = /*#__PURE__*/ import_react.forwardRef(function Grid({ width, columns, gap = 3, repeat = "fit", ...props }, ref) {
		const __css = {
			display: "grid",
			gridGap: gap,
			gridTemplateColumns: !!width ? widthToColumns(width, repeat) : countToColumns(columns)
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			...props,
			...__internalProps({
				__themeKey: "grids",
				__css
			})
		});
	});
	Box = Box$1;
	Button = /*#__PURE__*/ import_react.forwardRef(function Button(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box, {
			ref,
			as: "button",
			variant: "primary",
			...props,
			...__internalProps({
				__themeKey: "buttons",
				__css: {
					appearance: "none",
					display: props.hidden ? void 0 : "inline-block",
					textAlign: "center",
					lineHeight: "inherit",
					textDecoration: "none",
					fontSize: "inherit",
					px: 3,
					py: 2,
					color: "white",
					bg: "primary",
					border: 0,
					borderRadius: 4
				}
			})
		});
	});
	Link = /*#__PURE__*/ import_react.forwardRef(function Link(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "a",
			variant: "styles.a",
			...props,
			...__internalProps({ __themeKey: "links" })
		});
	});
	Paragraph = /*#__PURE__*/ import_react.forwardRef(function Paragraph(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "p",
			variant: "paragraph",
			...props,
			...__internalProps({
				__themeKey: "text",
				__css: {
					fontFamily: "body",
					fontWeight: "body",
					lineHeight: "body"
				}
			})
		});
	});
	Text = /*#__PURE__*/ import_react.forwardRef(function Text(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			as: "span",
			ref,
			variant: "default",
			...props,
			...__internalProps({ __themeKey: "text" })
		});
	});
	Heading = /*#__PURE__*/ import_react.forwardRef(function Heading(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "h2",
			variant: "heading",
			...props,
			...__internalProps({
				__themeKey: "text",
				__css: {
					fontFamily: "heading",
					fontWeight: "heading",
					lineHeight: "heading"
				}
			})
		});
	});
	Image = /*#__PURE__*/ import_react.forwardRef(function Image(props, ref) {
		const __outerCss = props.__css;
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "img",
			...props,
			...__internalProps({
				__themeKey: "images",
				__css: {
					maxWidth: "100%",
					height: "auto",
					...__outerCss
				}
			})
		});
	});
	Card = /*#__PURE__*/ import_react.forwardRef(function Card(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			variant: "primary",
			...props,
			...__internalProps({ __themeKey: "cards" })
		});
	});
	Label = /*#__PURE__*/ import_react.forwardRef(function Label(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "label",
			variant: "label",
			...props,
			...__internalProps({
				__themeKey: "forms",
				__css: {
					width: "100%",
					display: "flex"
				}
			})
		});
	});
	autofillStyles = {
		boxShadow: "inset 0 0 0 1000px var(--theme-ui-input-autofill-bg)",
		fontSize: "inherit",
		":first-line": { fontSize: "1rem" }
	};
	defaultInputStyles = {
		display: "block",
		width: "100%",
		p: 2,
		appearance: "none",
		fontSize: "inherit",
		lineHeight: "inherit",
		border: "1px solid",
		borderRadius: 4,
		color: "inherit",
		bg: "transparent",
		":autofill, :autofill:hover, :autofill:focus": autofillStyles,
		":-webkit-autofill, :-webkit-autofill:hover, :-webkit-autofill:focus": autofillStyles
	};
	Input = /*#__PURE__*/ import_react.forwardRef(function Input({ sx, autofillBackgroundColor = "background", ...rest }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "input",
			variant: "input",
			sx: {
				"--theme-ui-input-autofill-bg": (theme) => theme.colors && (0, import_theme_ui_css_cjs.get)(theme.colors, autofillBackgroundColor, null),
				...sx
			},
			...rest,
			...__internalProps({
				__themeKey: "forms",
				__css: defaultInputStyles
			})
		});
	});
	SVG = /*#__PURE__*/ import_react.forwardRef(function SVG({ size = 24, ...rest }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "svg",
			xmlns: "http://www.w3.org/2000/svg",
			width: size,
			height: size,
			viewBox: "0 0 24 24",
			fill: "currentcolor",
			...rest
		});
	});
	SVG.displayName = "SVG";
	DownArrow = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(SVG, {
		...props,
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M7 10l5 5 5-5z" })
	});
	Select = /*#__PURE__*/ import_react.forwardRef(function Select({ arrow, ...props }, ref) {
		const __css = {
			display: "block",
			width: "100%",
			p: 2,
			paddingRight: 4,
			appearance: "none",
			fontSize: "inherit",
			lineHeight: "inherit",
			border: "1px solid",
			borderRadius: 4,
			color: "inherit",
			backgroundColor: (theme) => (0, import_theme_ui_css_cjs.get)(theme, "colors.background", null)
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			...getMargin(props),
			sx: { display: "flex" },
			children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
				ref,
				as: "select",
				variant: "select",
				...omitMargin(props),
				...__internalProps({
					__themeKey: "forms",
					__css
				})
			}), arrow || (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(DownArrow, { sx: {
				ml: -28,
				alignSelf: "center",
				pointerEvents: "none"
			} })]
		});
	});
	Textarea = /*#__PURE__*/ import_react.forwardRef(function Textarea(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "textarea",
			variant: "textarea",
			...props,
			...__internalProps({
				__themeKey: "forms",
				__css: {
					display: "block",
					width: "100%",
					p: 2,
					appearance: "none",
					fontSize: "inherit",
					lineHeight: "inherit",
					border: "1px solid",
					borderRadius: 4,
					color: "inherit",
					bg: "transparent",
					fieldSizing: "content"
				}
			})
		});
	});
	RadioChecked = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(SVG, {
		...props,
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" })
	});
	RadioUnchecked = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(SVG, {
		...props,
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" })
	});
	RadioIcon = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(import_react.Fragment, { children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(RadioChecked, {
		...props,
		...__internalProps({ __css: {
			display: "none",
			"input:checked ~ &": { display: "block" }
		} })
	}), (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(RadioUnchecked, {
		...props,
		...__internalProps({ __css: {
			display: "block",
			"input:checked ~ &": { display: "none" }
		} })
	})] });
	Radio = /*#__PURE__*/ import_react.forwardRef(function Radio({ className, sx, variant = "radio", ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			sx: { minWidth: "min-content" },
			children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
				ref,
				as: "input",
				type: "radio",
				...props,
				sx: {
					position: "absolute",
					opacity: 0,
					zIndex: -1,
					width: 1,
					height: 1,
					overflow: "hidden"
				}
			}), (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
				as: RadioIcon,
				"aria-hidden": "true",
				variant,
				className,
				sx,
				...__internalProps({
					__themeKey: "forms",
					__css: {
						mr: 2,
						borderRadius: 9999,
						color: "gray",
						flexShrink: 0,
						"input:checked ~ &": { color: "primary" },
						"input:focus ~ &": { bg: "highlight" }
					}
				})
			})]
		});
	});
	CheckboxChecked = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(SVG, {
		...props,
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" })
	});
	CheckboxUnchecked = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(SVG, {
		...props,
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" })
	});
	CheckboxIcon = (props) => (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(import_react.Fragment, { children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(CheckboxChecked, {
		...props,
		...__internalProps({ __css: {
			display: "none",
			"input:checked ~ &": { display: "block" }
		} })
	}), (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(CheckboxUnchecked, {
		...props,
		...__internalProps({ __css: {
			display: "block",
			"input:checked ~ &": { display: "none" }
		} })
	})] });
	Checkbox = /*#__PURE__*/ import_react.forwardRef(function Checkbox({ className, sx, variant = "checkbox", children, ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			sx: { minWidth: "min-content" },
			children: [
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
					ref,
					as: "input",
					type: "checkbox",
					...props,
					sx: {
						position: "absolute",
						opacity: 0,
						zIndex: -1,
						width: 1,
						height: 1,
						overflow: "hidden"
					}
				}),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
					as: CheckboxIcon,
					"aria-hidden": "true",
					variant,
					className,
					sx,
					...__internalProps({
						__themeKey: "forms",
						__css: {
							mr: 2,
							borderRadius: 4,
							color: "gray",
							flexShrink: 0,
							"input:checked ~ &": { color: "primary" },
							"input:focus ~ &": {
								color: "primary",
								bg: "highlight"
							}
						}
					})
				}),
				children
			]
		});
	});
	GUTTER = 2;
	SIZE = 18;
	Switch = /*#__PURE__*/ import_react.forwardRef(function Switch({ className, label, sx, variant = "switch", ...rest }, ref) {
		const __css = {
			position: "relative",
			flexShrink: 0,
			bg: "gray",
			borderRadius: SIZE,
			height: 22,
			width: 40,
			mr: 2,
			"input:disabled ~ &": {
				opacity: .5,
				cursor: "not-allowed"
			},
			"& > div": {
				display: "flex",
				alignItems: "center",
				borderRadius: "50%",
				height: SIZE,
				width: SIZE,
				bg: "white",
				boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
				position: "relative",
				transform: "translateX(0%)",
				transition: `transform 240ms cubic-bezier(0.165, 0.840, 0.440, 1.000)`
			},
			"input:checked ~ &": {
				bg: "primary",
				"> div": { transform: "translateX(100%)" }
			}
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Label, {
			sx: { cursor: "pointer" },
			children: [
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
					ref,
					as: "input",
					type: "checkbox",
					"aria-label": label,
					...rest,
					sx: {
						position: "absolute",
						opacity: 0,
						zIndex: -1,
						width: 1,
						height: 1,
						overflow: "hidden"
					},
					...__internalProps({ __themeKey: "forms" })
				}),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
					css: { padding: GUTTER },
					variant,
					className,
					sx,
					...__internalProps({
						__themeKey: "forms",
						__css
					}),
					children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {})
				}),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("span", { children: label })
			]
		});
	});
	thumbStyle = {
		appearance: "none",
		width: 16,
		height: 16,
		bg: "currentcolor",
		border: 0,
		borderRadius: 9999,
		variant: "forms.slider.thumb"
	};
	sliderStyle = {
		display: "block",
		width: "100%",
		height: 4,
		my: 2,
		cursor: "pointer",
		appearance: "none",
		borderRadius: 9999,
		color: "inherit",
		bg: "gray",
		":focus": {
			outline: "none",
			color: "primary"
		},
		"&::-webkit-slider-thumb": thumbStyle,
		"&::-moz-range-thumb": thumbStyle,
		"&::-ms-thumb": thumbStyle
	};
	Slider = /*#__PURE__*/ import_react.forwardRef(function Slider(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "input",
			type: "range",
			variant: "slider",
			...props,
			...__internalProps({
				__themeKey: "forms",
				__css: sliderStyle
			})
		});
	});
	Field = /*#__PURE__*/ import_react.forwardRef(function Field({ as: Control = Input, label, id, name, ...rest }, ref) {
		const fieldIdentifier = id || name;
		const controlProps = {
			ref,
			name,
			id: fieldIdentifier,
			...omitMargin(rest)
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			...getMargin(rest),
			children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Label, {
				htmlFor: fieldIdentifier,
				children: label
			}), (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Control, { ...controlProps })]
		});
	});
	Progress = /*#__PURE__*/ import_react.forwardRef(function Progress(props, ref) {
		const __css = {
			display: "block",
			width: "100%",
			height: "4px",
			margin: 0,
			padding: 0,
			overflow: "hidden",
			appearance: "none",
			color: "primary",
			bg: "gray",
			borderRadius: 9999,
			border: "none",
			"&::-webkit-progress-bar": { bg: "transparent" },
			"&::-webkit-progress-value": { bg: "currentcolor" },
			"&::-moz-progress-bar": { bg: "currentcolor" }
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "progress",
			variant: "styles.progress",
			...props,
			...__internalProps({ __css })
		});
	});
	Donut = /*#__PURE__*/ import_react.forwardRef(function Donut({ size = 128, strokeWidth = 2, value = 0, min = 0, max = 1, title, ...props }, ref) {
		const r = 16 - (typeof strokeWidth === "number" ? strokeWidth : parseFloat(strokeWidth));
		const C = 2 * r * Math.PI;
		const offset = C - (value - min) / (max - min) * C;
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			ref,
			as: "svg",
			role: "img",
			"aria-valuenow": value,
			"aria-valuemin": min,
			"aria-valuemax": max,
			strokeWidth,
			viewBox: "0 0 32 32",
			width: size,
			height: size,
			fill: "none",
			stroke: "currentcolor",
			...props,
			...__internalProps({ __css: { color: "primary" } }),
			children: [
				title && (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("title", { children: title }),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("circle", {
					cx: 16,
					cy: 16,
					r,
					opacity: 1 / 8
				}),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("circle", {
					cx: 16,
					cy: 16,
					r,
					strokeDasharray: C,
					strokeDashoffset: offset,
					transform: "rotate(-90 16 16)"
				})
			]
		});
	});
	Spinner = /*#__PURE__*/ import_react.forwardRef(function Spinner({ size = 48, strokeWidth = 4, max = 1, title = "Loading", duration = 750, ...props }, ref) {
		const __css = {
			color: "primary",
			overflow: "visible"
		};
		const svgProps = {
			strokeWidth,
			viewBox: "0 0 32 32",
			width: size,
			height: size,
			fill: "none",
			stroke: "currentColor",
			role: "img"
		};
		const circleProps = {
			strokeWidth,
			r: 16 - strokeWidth,
			cx: 16,
			cy: 16,
			fill: "none"
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			ref,
			as: "svg",
			...svgProps,
			...props,
			...__internalProps({ __css }),
			children: [
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("title", { children: title }),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("circle", {
					...circleProps,
					opacity: 1 / 8
				}),
				(0, import_theme_ui_core_jsx_runtime_cjs.jsx)("circle", {
					...circleProps,
					strokeDasharray: "20 110",
					children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("animateTransform", {
						attributeName: "transform",
						attributeType: "XML",
						type: "rotate",
						from: "0 16 16",
						to: "360 16 16",
						dur: `${duration}ms`,
						repeatCount: "indefinite"
					})
				})
			]
		});
	});
	Avatar = /*#__PURE__*/ import_react.forwardRef(function Avatar({ size = 48, ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Image, {
			ref,
			width: size,
			height: size,
			variant: "avatar",
			...props,
			...__internalProps({ __css: { borderRadius: 9999 } })
		});
	});
	Badge = /*#__PURE__*/ import_react.forwardRef(function Badge(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			variant: "primary",
			...props,
			...__internalProps({
				__themeKey: "badges",
				__css: {
					display: "inline-block",
					verticalAlign: "baseline",
					fontSize: 0,
					fontWeight: "bold",
					whiteSpace: "nowrap",
					px: 1,
					borderRadius: 2,
					color: "white",
					bg: "primary"
				}
			})
		});
	});
	IconButton = /*#__PURE__*/ import_react.forwardRef(function IconButton({ size = 32, ...props }, ref) {
		const emotionCssLabel = props.__css?.label || "IconButton";
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "button",
			variant: "icon",
			...props,
			...__internalProps({
				__themeKey: "buttons",
				__css: {
					label: emotionCssLabel,
					appearance: "none",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					padding: 1,
					width: size,
					height: size,
					color: "inherit",
					bg: "transparent",
					border: "none",
					borderRadius: 4
				}
			})
		});
	});
	CloseIcon = (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("svg", {
		xmlns: "http://www.w3.org/2000/svg",
		width: "24",
		height: "24",
		fill: "currentColor",
		viewBox: "0 0 24 24",
		children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" })
	});
	Close = /*#__PURE__*/ import_react.forwardRef(function Close({ size = 32, ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(IconButton, {
			ref,
			size,
			title: "Close",
			"aria-label": "Close",
			variant: "close",
			...props,
			children: CloseIcon
		});
	});
	Alert = /*#__PURE__*/ import_react.forwardRef(function Alert(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			variant: "primary",
			role: "alert",
			...props,
			...__internalProps({
				__themeKey: "alerts",
				__css: {
					display: "flex",
					alignItems: "center",
					px: 3,
					py: 2,
					fontWeight: "bold",
					color: "white",
					bg: "primary",
					borderRadius: 4
				}
			})
		});
	});
	Divider = /*#__PURE__*/ import_react.forwardRef(function Divider(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			as: "hr",
			variant: "styles.hr",
			...props,
			...__internalProps({ __css: {
				color: "gray",
				m: 0,
				my: 2,
				border: 0,
				borderBottom: "1px solid"
			} })
		});
	});
	getContainerProps = getProps(__isBoxStyledSystemProp);
	getIframeProps = getProps((str) => !__isBoxStyledSystemProp(str));
	Embed = /*#__PURE__*/ import_react.forwardRef(function Embed({ variant, sx, ratio = 16 / 9, src, frameBorder = 0, allowFullScreen = true, width = 560, height = 315, allow, ...rest }, ref) {
		const iframeProps = {
			src,
			width,
			height,
			frameBorder,
			allowFullScreen,
			allow,
			...getIframeProps(rest)
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			variant,
			sx,
			...getContainerProps(rest),
			...__internalProps({ __css: {
				width: "100%",
				height: 0,
				paddingBottom: 100 / ratio + "%",
				position: "relative",
				overflow: "hidden"
			} }),
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
				ref,
				as: "iframe",
				...iframeProps,
				...__internalProps({ __css: {
					position: "absolute",
					width: "100%",
					height: "100%",
					top: 0,
					bottom: 0,
					left: 0,
					border: 0
				} })
			})
		});
	});
	AspectRatio = /*#__PURE__*/ import_react.forwardRef(function AspectRatio({ ratio = 4 / 3, children, ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(Box$1, {
			ref,
			sx: {
				position: "relative",
				overflow: "hidden"
			},
			children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, { sx: {
				width: "100%",
				height: 0,
				paddingBottom: 100 / ratio + "%"
			} }), (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
				...props,
				...__internalProps({ __css: {
					position: "absolute",
					top: 0,
					right: 0,
					bottom: 0,
					left: 0
				} }),
				children
			})]
		});
	});
	AspectImage = /*#__PURE__*/ import_react.forwardRef(function AspectImage({ ratio, ...props }, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(AspectRatio, {
			ratio,
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Image, {
				ref,
				...props,
				...__internalProps({ __css: { objectFit: "cover" } })
			})
		});
	});
	Container = /*#__PURE__*/ import_react.forwardRef(function Container(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			variant: "container",
			...props,
			...__internalProps({
				__themeKey: "layout",
				__css: {
					width: "100%",
					maxWidth: "container",
					mx: "auto"
				}
			})
		});
	});
	NavLink = /*#__PURE__*/ import_react.forwardRef(function NavLink(props, ref) {
		const __css = {
			color: "inherit",
			textDecoration: "none",
			fontWeight: "bold",
			display: "inline-block",
			"&:hover, &:focus, &.active": { color: "primary" }
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Link, {
			ref,
			variant: "nav",
			...props,
			...__internalProps({ __css })
		});
	});
	Message = /*#__PURE__*/ import_react.forwardRef(function Message(props, ref) {
		const __css = {
			padding: 3,
			paddingLeft: (t) => t.space && Number(t.space[3]) - Number(t.space[1]),
			borderLeftWidth: (t) => t.space && Number(t.space[1]),
			borderLeftStyle: "solid",
			borderLeftColor: "primary",
			borderRadius: 4,
			bg: "highlight"
		};
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(Box$1, {
			ref,
			...props,
			...__internalProps({
				__themeKey: "messages",
				__css
			})
		});
	});
	MenuIcon = ({ size = 24 }) => {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("svg", {
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 24 24",
			width: size,
			height: size,
			fill: "currentColor",
			css: {
				display: "block",
				margin: 0,
				boxSizing: "border-box",
				minWidth: 0
			},
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" })
		});
	};
	MenuButton = /*#__PURE__*/ import_react.forwardRef(function MenuButton(props, ref) {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(IconButton, {
			ref,
			title: "Menu",
			"aria-label": "Toggle Menu",
			variant: "menu",
			...props,
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(MenuIcon, {})
		});
	});
}));
//#endregion
export { theme_ui_components_esm_exports as n, init_theme_ui_components_esm as t };
