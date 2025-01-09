function removeKeys<T extends Record<PropertyKey, unknown>>(obj: T, keys: (keyof T)[]): T {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result;
}

export { removeKeys };
