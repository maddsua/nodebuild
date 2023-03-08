export const trim = (path: string) => {
	path = path.replace(/\\+|\/+/g, '/');
	if (path.endsWith('/')) path = path.slice(0, -1);
	if (path.startsWith('/')) path = path.slice(1);
	return path;
};

export const noExtension = (path: string) => path.replace(/\..+$/, '');

export const noFile = (path: string) => {
	const slash = path.lastIndexOf('/');
	if (slash < 0) return './';
	return path.slice(0, slash)
};

export const separate = (path:string) => {
	const pathDir = path.match(/^.*\//)[0] || './';
	const pathFile = pathDir.length > 1 ? path.substring(pathDir.length) : path;
	return { dir: pathDir, file: pathFile };
};