#!/usr/bin/env node

import fse from 'fs-extra';
import process from 'process';

try {

	fse.copySync('static', 'public', { overwrite: true });

} catch (error) {
	console.error(error);
	process.exit(1);
}

console.log('Yeah, seems fine');