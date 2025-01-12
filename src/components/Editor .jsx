/** @format */

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas";
import { Button, Typography, Box, MenuItem, Select } from "@mui/material";
import {
	Save,
	PlayArrow,
	Brightness4,
	Brightness7,
	FormatAlignLeft,
	Refresh,
	Download,
	Image,
	ZoomOut,
	ZoomIn,
} from "@mui/icons-material";
import prettier from "prettier";
import { toast } from "react-toastify";

const Editor = () => {
	const [darkMode, setDarkMode] = useState(true);
	const [language, setLanguage] = useState("java");
	const [fontSize, setFontSize] = useState(22);
	const [code, setCode] = useState("");
	const [langName, setLangName] = useState("main.java");
	const [iframeLoaded, setIframeLoaded] = useState(false);

	// Set iframe source with dynamic parameters for dark mode, font size, and language
	const iframeSrc = `https://onecompiler.com/embed/${language}?theme=${darkMode ? "dark" : "light"}&fontSize=${fontSize}&listenToEvents=true&hideNew=true&codeChangeEvent=true&hideRun=true&hideTitle=true`;

	// Handle incoming messages from the iframe
	const handleMessage = (e) => {
		if (e.data.files && e.data.files[0]?.content) {
			console.log(
				"---------------------------------------------------------------------------------------------------------------------------------------------------------",
				e.data.files[0],
			);
			setLangName(e.data.files[0].name);
			setCode(e.data.files[0].content);
		}
	};

	// Save the current code to localStorage
	const saveCode = () => {
		localStorage.setItem("editorCode", code);
		toast.success("Code saved successfully!");
	};

	// Trigger the "Run Code" action in the iframe
	const runCode = () => {
		const iframe = document.querySelector("iframe");
		if (iframe) {
			iframe.contentWindow.postMessage(
				{ eventType: "triggerRun" },
				"https://onecompiler.com",
			);
		}
		triggerConfetti();
	};

	// Trigger confetti animation
	const triggerConfetti = () => {
		confetti({
			particleCount: 300,
			spread: 120,
			origin: { y: 0.8 },
		});
	};

	// Toggle dark mode
	const toggleDarkMode = () => {
		setDarkMode((prev) => {
			const newMode = !prev;
			toast.info(`Switched to ${newMode ? "dark" : "light"} mode`);
			return newMode;
		});
	};

	// Increase the font size with a limit
	const increaseFontSize = () => {
		setFontSize((prev) => Math.min(prev + 2, 32));
	};

	// Decrease the font size with a limit
	const decreaseFontSize = () => {
		setFontSize((prev) => Math.max(prev - 2, 8));
	};

	// Format the code using Prettier
	const formatCode = async () => {
		if (!code) return;
		try {
			let formattedCode;
			const languageParserMapping = {
				javascript: "babel",
				python: "python",
				java: "java",
				c: "c",
			};
			const parser = languageParserMapping[language] || "babel"; // Default to 'babel' for JavaScript
			formattedCode = await prettier.format(code, {
				semi: true,
				singleQuote: true,
				parser: parser,
			});
			setCode(formattedCode);
			toast.success("Code formatted successfully!");
		} catch (error) {
			console.error("Error formatting code:", error);
			toast.error("Formatting failed.");
		}
	};

	// Reset the code and remove from localStorage
	const resetCode = () => {
		setCode(""); // Clear code state
		localStorage.removeItem("editorCode"); // Remove from localStorage
		const iframe = document.getElementById("oc-editor");
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.postMessage(
				{
					eventType: "populateCode",
					language: language,
					files: [{ name: langName, content: "" }],
				},
				"*",
			);
		}
		toast.warn("Code editor reset!");
	};

	// Handle language selection change
	const handleLanguageChange = (event) => {
		setLanguage(event.target.value);
	};

	// Download code as a file
	const downloadCode = () => {
		const blob = new Blob([code], { type: "text/plain" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = langName;
		link.click();
		toast.success("Code downloaded as a file!");
	};

	// Download code as an image
	const downloadCodeAsImage = () => {
		if (!code.trim()) {
			toast.error("No code to download as an image!");
			return;
		}
		const codeContainer = document.createElement("div");
		codeContainer.style.fontFamily = "monospace";
		codeContainer.style.fontSize = `${fontSize}px`;
		codeContainer.style.whiteSpace = "pre-wrap";
		codeContainer.style.padding = "20px";
		codeContainer.style.color = darkMode ? "#FFFFFF" : "#000000";
		codeContainer.style.backgroundColor = darkMode ? "#24242b" : "#F5F5F5";
		codeContainer.style.borderRadius = "10px";
		codeContainer.innerText = code;
		document.body.appendChild(codeContainer);
		html2canvas(codeContainer, { backgroundColor: null })
			.then((canvas) => {
				document.body.removeChild(codeContainer);
				const link = document.createElement("a");
				link.href = canvas.toDataURL("image/png");
				link.download = `${langName}.png`;
				link.click();
				toast.success("Code downloaded as an image!");
			})
			.catch((error) => {
				console.error("Error downloading code as an image:", error);
				toast.error("Failed to download code as an image.");
			});
	};

	// --------------------------------USE EFFECT--------------------------------------------
	useEffect(() => {
		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	// Load saved code from localStorage on mount
	useEffect(() => {
		const savedCode = localStorage.getItem("editorCode");
		if (savedCode) {
			setCode(savedCode);
		}
	}, []);

	// When iframe is loaded, immediately send the saved code to the iframe
	useEffect(() => {
		if (iframeLoaded) {
			const iframe = document.getElementById("oc-editor");
			if (iframe && iframe.contentWindow) {
				iframe.contentWindow.postMessage(
					{
						eventType: "populateCode",
						language: language,
						files: [{ name: langName, content: code }],
					},
					"*",
				);
			}
		}
	}, [iframeLoaded, code, language]);

	// Store the code in localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("editorCode", code);
	}, [code]);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "space-between",
				bgcolor: darkMode ? "#24242b" : "#F5F5F5",
				color: darkMode ? "grey.100" : "grey.900",
				p: 4,
			}}>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					maxWidth: "lg",
					mb: 3,
				}}>
				<Typography
					variant="h4"
					fontWeight="bold">
					Code Editor by Faisal
				</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Select
						value={language}
						onChange={handleLanguageChange}>
						<MenuItem value="javascript">JavaScript</MenuItem>
						<MenuItem value="python">Python</MenuItem>
						<MenuItem value="java">Java</MenuItem>
						<MenuItem value="c">C</MenuItem>
					</Select>
					<Button
						onClick={toggleDarkMode}
						variant="contained">
						{darkMode ?
							<Brightness7 />
						:	<Brightness4 />}
						{darkMode ? "Light Mode" : "Dark Mode"}
					</Button>
				</Box>
			</Box>

			<iframe
				id="oc-editor"
				title="Code Editor"
				style={{
					border: "none",
					width: "100%",
					height: "70vh",
					borderRadius: "8px",
				}}
				src={iframeSrc}
				onLoad={() => setIframeLoaded(true)}
			/>

			<Box
				sx={{
					display: "flex",
					justifyContent: "space-evenly",
					alignContent: "center",
					gap: 2,
					mt: 4,
					width: "100%",
				}}>
				<Button
					onClick={saveCode}
					variant="contained"
					color="success">
					<Save />
					Save Code
				</Button>
				<Button
					onClick={formatCode}
					variant="contained"
					color="primary">
					<FormatAlignLeft />
					Format Code
				</Button>
				<Button
					onClick={resetCode}
					variant="outlined"
					color="error">
					<Refresh />
					Reset Code
				</Button>
				<Button
					onClick={runCode}
					variant="contained"
					color="warning">
					<PlayArrow />
					Run Code
				</Button>
				<Button
					onClick={downloadCode}
					variant="contained"
					color="info">
					<Download />
					Download Code
				</Button>
				<Button
					onClick={downloadCodeAsImage}
					variant="contained"
					color="secondary">
					<Image />
					Download as Image
				</Button>
				<div>
					<Button
						onClick={increaseFontSize}
						variant="contained"
						color="secondary">
						<ZoomIn />
					</Button>
					<Button
						onClick={decreaseFontSize}
						variant="contained"
						color="secondary">
						<ZoomOut />
					</Button>
				</div>
			</Box>
		</Box>
	);
};

export default Editor;
