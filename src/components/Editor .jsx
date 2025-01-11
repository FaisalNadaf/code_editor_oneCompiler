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
	ZoomIn,
	ZoomOut,
	FormatAlignLeft,
	Refresh,
	Download,
	Image,
} from "@mui/icons-material";
import prettier from "prettier";
import { toast } from "react-toastify";

const Editor = () => {
	const [darkMode, setDarkMode] = useState(true);
	const [language, setLanguage] = useState("python");
	const [fontSize, setFontSize] = useState(18);
	const [code, setCode] = useState("");

	const iframeSrc = `https://onecompiler.com/embed/${language}?theme=${
		darkMode ? "dark" : "light"
	}&fontSize=${fontSize}&listenToEvents=true&hideNew=true&codeChangeEvent=true&hideRun=true&hideTitle=true`;

	useEffect(() => {
		// Load the saved code from localStorage on page load
		const savedCode = localStorage.getItem("editorCode");
		if (savedCode) {
			setCode(savedCode);
		}

		// Handle messages from the iframe editor
		const handleMessage = (e) => {
			const allowedOrigin = "https://onecompiler.com";
			if (e.origin !== allowedOrigin) return;

			if (e.data && e.data.code) {
				console.log("Code received from iframe:", e.data.code);
				setCode(e.data.code); // Update the code state with the received code
			}
		};

		window.addEventListener("message", handleMessage);

		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, []);

	useEffect(() => {
		// Whenever code state changes, update iframe with new code
		const iframe = document.getElementById("oc-editor");
		if (iframe) {
			iframe.contentWindow.postMessage(
				{
					eventType: "populateCode",
					language: language,
					files: [
						{
							name: `${language === "python" ? "main.py" : "main.js"}`,
							content: code,
						},
					],
				},
				"*",
			);
		}
	}, [code, language]);

	const saveCode = () => {
		localStorage.setItem("editorCode", code);
		toast.success("Code saved successfully!");
	};

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

	const triggerConfetti = () => {
		confetti({
			particleCount: 300,
			spread: 120,
			origin: { y: 0.8 },
		});
	};

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
		toast.info(`Switched to ${darkMode ? "light" : "dark"} mode`);
	};

	const increaseFontSize = () => {
		setFontSize((prevFontSize) => Math.min(prevFontSize + 2, 32));
	};

	const decreaseFontSize = () => {
		setFontSize((prevFontSize) => Math.max(prevFontSize - 2, 8));
	};

	const formatCode = () => {
		if (!code) return;

		try {
			const formattedCode = prettier.format(code, {
				semi: true,
				singleQuote: true,
				parser: "babel",
			});

			setCode(formattedCode);
			toast.success("Code formatted successfully!");
		} catch (error) {
			console.error("Error formatting code:", error);
			toast.error("Formatting failed.");
		}
	};

	const resetCode = () => {
		setCode("");
		toast.warn("Code editor reset!");
	};

	const handleLanguageChange = (event) => {
		setLanguage(event.target.value);
	};

	const downloadCode = () => {
		const blob = new Blob([code], { type: "text/plain" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `code.${language}`;
		link.click();
		toast.success("Code downloaded as a file!");
	};

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
				link.download = "code-editor.png";
				link.click();
				toast.success("Code downloaded as an image!");
			})
			.catch((error) => {
				console.error("Error downloading code as an image:", error);
				toast.error("Failed to download code as an image.");
			});
	};

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
				overflow: "hidden",
				height: "100vh",
			}}>
			{/* Header Section */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					maxWidth: "lg",
					mb: 3,
				}}>
				<Typography
					variant="h4"
					fontWeight="bold"
					color="primary.main">
					Code Editor by Faisal
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<Select
						value={language}
						onChange={handleLanguageChange}
						variant="outlined"
						size="small"
						sx={{ bgcolor: "white", borderRadius: "8px" }}>
						<MenuItem value="javascript">JavaScript</MenuItem>
						<MenuItem value="python">Python</MenuItem>
						<MenuItem value="java">Java</MenuItem>
						<MenuItem value="c">C</MenuItem>
					</Select>
					<Button
						onClick={toggleDarkMode}
						variant="contained"
						startIcon={darkMode ? <Brightness7 /> : <Brightness4 />}
						sx={{ borderRadius: "20px" }}>
						{darkMode ? "Light Mode" : "Dark Mode"}
					</Button>
				</Box>
			</Box>

			{/* Fullscreen Code Editor */}
			<iframe
				id="oc-editor"
				title="Faisal Editor"
				style={{
					border: "none",
					width: "100%",
					height: "70vh",
					borderRadius: "8px",
				}}
				src={iframeSrc}></iframe>

			{/* Action Buttons */}
			<Box sx={{ display: "flex", gap: 2, mt: 4, width: "100%" }}>
				<Button
					onClick={saveCode}
					variant="contained"
					color="success"
					startIcon={<Save />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Save Code
				</Button>
				<Button
					onClick={formatCode}
					variant="contained"
					color="primary"
					startIcon={<FormatAlignLeft />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Format Code
				</Button>
				<Button
					onClick={resetCode}
					variant="outlined"
					color="error"
					startIcon={<Refresh />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Reset Code
				</Button>
				<Button
					onClick={runCode}
					variant="contained"
					color="warning"
					startIcon={<PlayArrow />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Run Code
				</Button>
				<Button
					onClick={downloadCode}
					variant="contained"
					color="info"
					startIcon={<Download />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Download Code
				</Button>
				<Button
					onClick={downloadCodeAsImage}
					variant="contained"
					color="secondary"
					startIcon={<Image />}
					sx={{ borderRadius: "20px", paddingX: 4, flexGrow: 1 }}>
					Download as Image
				</Button>
			</Box>
		</Box>
	);
};

export default Editor;
