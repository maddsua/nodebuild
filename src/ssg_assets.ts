import fs from 'fs';
import sharp from 'sharp';
import process from 'process';

import * as path from './path.js';
import * as mdir from './dir.js';
import * as mcon from './console.js';

let pathsInput = '';

for (const arg of process.argv.slice(2)) {
	if (/^.+\:.+$/.test(arg)) {
		pathsInput = arg;
		break;
	}
}

if (!pathsInput.length) {
	console.error('Run this script like this: node assets.mjs [input dir]:[output dir]')
	process.exit(1);
}

let assetsInput = path.trim(pathsInput.slice(0, pathsInput.indexOf(':')));
let assetsOutput = path.trim(pathsInput.slice(pathsInput.indexOf(':') + 1));

//	static config
const quality = {
	avif: 80,
	webp: 85,
	jpg: 75,
	png: 85
};

console.log('Starting media assets processing...');

interface i_asset {
	source: string,
	dest: string,
	destNoExt: string,
	destDir: string,
	name: string
}

let assetFiles: Array<i_asset> = [];

try {

	assetFiles = mdir.list(assetsInput).map((entry) => {
		return {
			source: `${assetsInput}/${entry}`,
			dest: `${assetsOutput}/${entry}`,
			destNoExt: path.noExtension(`${assetsOutput}/${entry}`),
			destDir: path.noFile(`${assetsOutput}/${entry}`),
			name: entry
		}
	}).filter((entry) => (entry.source.includes('assets/') || entry.source.includes('/assets')));

} catch (error) {
	console.error(mcon.colorText(' Directory does not exist ', 'red', 'reverse'), `: "${assetsInput}"`);
	process.exit(1);	
}

if (!assetFiles.length) {
	console.error(mcon.colorText(' No assets found ', 'red', 'reverse'), `in "${assetsInput}"`);
	process.exit(2);
}

//	get image files of formats that need to be converted
const convertAssets = assetFiles.filter((entry) => /\.(png)|(jpg)$/.test(entry.name));

//	compress the hell out of the images
const queue = convertAssets.map(async (asset) => {

	const isTransparent = asset.name.endsWith('.png');
	
	if (!fs.existsSync(asset.destDir)) fs.mkdirSync(asset.destDir, {recursive: true});

	try {

		await sharp(asset.source).toFormat('webp', {quality: quality.webp}).toFile(`${asset.destNoExt}.webp`);
		await sharp(asset.source).toFormat('avif', {quality: quality.avif}).toFile(`${asset.destNoExt}.avif`);

		if (isTransparent) await sharp(asset.source).toFormat('png', {quality: quality.png, compressionLevel: 7}).toFile(`${asset.destNoExt}.png`);
			else await sharp(asset.source).toFormat('jpg', {quality: quality.jpg}).toFile(`${asset.destNoExt}.jpg`);

	} catch (error) {
		console.error('Sharp error:', error);
		process.exit(11);
	}

	console.log(`Done [Image] ${asset.destNoExt}`);
});

await Promise.all(queue);

//	get all the other files that we just want to copy
const copyAssets = assetFiles.filter((entry) => /\.(svg)|(webp)|(webm)|(avif)|(mp4)|(mov)|(mp3)|(ogg)|(ogv)|(gif)$/.test(entry.name));
copyAssets.forEach((asset) => {

	if (asset.name.endsWith('.svg') && !asset.name.includes('_nobundle')) return;

	if (!fs.existsSync(asset.destDir)) fs.mkdirSync(asset.destDir, {recursive: true});

	fs.copyFileSync(asset.source, asset.dest);

	console.log(`Copied [File] ${asset.dest}`);
});

console.log('Assets processing done!');
