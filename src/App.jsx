/** @format */

import React from "react";
import Editor from "./components/Editor ";
import { ToastContainer } from "react-toastify";
const App = () => {
	return (
		<div>
			<Editor />
			<ToastContainer
				position="bottom-right"
				autoClose={1500}
				hideProgressBar={false}
				theme="dark"
			/>
		</div>
	);
};

export default App;
