import fs from 'fs';
import sharp from 'sharp';
import { exit } from 'process';

import * as path from './path.js';
import * as dir from './dir.js';
import * as mcon from './console.js';

let inputs = '';

for (const arg of process.argv.slice(2)) {
	if (/^.+\:.+$/.test(arg)) {
		inputs = arg;
		break;
	}
}

if (!inputs.length) {
	console.error('Run this script like this: node assets.mjs [input dir]:[output dir]')
	exit(1);
}

let assetsInput = path.trim(inputs.slice(0, inputs.indexOf(':')));
let assetsOutput = path.trim(inputs.slice(inputs.indexOf(':') + 1));

//	static config
const quality = {
	avif: 80,
	webp: 85,
	jpg: 75,
	png: 85
};


console.log('Starting media assets processing...');

const assetFiles = dir.list(assetsInput).filter((entry) => entry.includes('assets/'));

if (!assetFiles.length) {
	console.error(mcon.colorText(' No assets found ', 'red', 'reverse'), `in ${assetsInput}`);
}

//	get image files of formats that need to be converted
const convertAssets = assetFiles.filter((item) => /\.(png)|(jpg)$/.test(item));

//	compress the hell out of the images
const queue = convertAssets.map(async (asset) => {
	const srcpath = `${assetsInput}/${asset}`;
	const destpath = `${assetsOutput}/${path.noExtension(asset)}`;
	const destdir = `${assetsOutput}/${path.noFile(path.noExtension(asset))}`;
	const isTransparent = asset.endsWith('.png');
	
	if (!fs.existsSync(destdir)) fs.mkdirSync(destdir, {recursive: true});

	try {

		await sharp(srcpath).toFormat('webp', {quality: quality.webp}).toFile(`${destpath}.webp`);
		await sharp(srcpath).toFormat('avif', {quality: quality.avif}).toFile(`${destpath}.avif`);

		if (isTransparent) await sharp(srcpath).toFormat('png', {quality: quality.png, compressionLevel: 7}).toFile(`${destpath}.png`);
			else await sharp(srcpath).toFormat('jpg', {quality: quality.jpg}).toFile(`${destpath}.jpg`);

	} catch (error) {
		console.error('Sharp error:', error);
		exit(110);
	}

	console.log(`Done [Image] ${destpath}`);
});

await Promise.all(queue);

//	get all the other files that we just want to copy
const copyAssets = assetFiles.filter((item) => /\.(svg)|(webp)|(webm)|(avif)|(mp4)|(mov)|(mp3)|(ogg)|(ogv)|(gif)$/.test(item));
copyAssets.forEach((asset) => {

	if (asset.endsWith('.svg') && !asset.includes('_nobundle')) return;

	const srcpath = `${assetsInput}/${asset}`;
	const destpath = `${assetsOutput}/${asset}`;
	const destdir = `${assetsOutput}/${path.noFile(asset)}`;

	if (!fs.existsSync(destdir)) fs.mkdirSync(destdir, {recursive: true});

	fs.copyFileSync(srcpath, destpath);

	console.log(`Copied [File] ${destpath}`);
});

console.log('Assets processing done!');
