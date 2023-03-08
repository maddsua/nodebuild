import fs from 'fs';

//	128 nested directories max
const maxSearchDepth = 128;

export const list = (searchDir: string) => {
	const results = [];
	let depth = -1;	//	(0 - 1) so on the first run the nesting will be equal to zero

	const dir_search = (searchDir: string) => {	
		depth++;

		if (!fs.existsSync(searchDir)) throw `Directory '${searchDir}' does not exist`;

		fs.readdirSync(searchDir).forEach((file) => {
			const filePath = `${searchDir}/${file}`;
			const stat = fs.lstatSync(filePath);
	
			if (stat.isDirectory() && depth < maxSearchDepth) dir_search(filePath);
				else if (!stat.isDirectory()) results.push(filePath.slice(searchDir.length + 1));
		});
		
		depth--;
	};

	dir_search(searchDir);
	
	return results;
};
