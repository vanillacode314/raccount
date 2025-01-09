import { H3Event, InferEventInput, ValidateFunction } from 'h3';

async function readValidatedFormData<
	T,
	Event extends H3Event = H3Event,
	_T = InferEventInput<'body', Event, T>
>(event: H3Event, validate: ValidateFunction<_T>): Promise<_T> {
	const formData = await readFormData(event);
	const data = Object.fromEntries(formData.entries());
	try {
		const result = await validate(data);
		if (result === false) {
			throw createError({
				message: 'Invalid Form Data',
				statusCode: 400,
				statusMessage: 'Bad Request'
			});
		} else if (result === true) {
			return data as _T;
		}
		return result ?? (data as _T);
	} catch {
		throw createError({
			message: 'Invalid Form Data',
			statusCode: 400,
			statusMessage: 'Bad Request'
		});
	}
}
export { readValidatedFormData };
