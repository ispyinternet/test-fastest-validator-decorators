import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import ts from "rollup-plugin-typescript2";

export default {
	input: "index.ts",
	output: {
    file: 'bundle.js',
    format: 'cjs'
  },
	plugins: [
		resolve(),
		commonjs(),
		ts()
	],
};
