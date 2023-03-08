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