var hasProp = Object.prototype.hasOwnProperty

function throwsMessage(err) {
	return '[Throws: ' + (err ? err.message : '?') + ']'
}

function safeGetValueFromPropertyOnObject(obj, property) {
	if (hasProp.call(obj, property)) {
		try {
			return obj[property]
		}
		catch (err) {
			return throwsMessage(err)
		}
	}

	return obj[property]
}

function ensureProperties(obj) {
	var seen = new WeakMap()

	function visit(obj) {
		if (obj === null || typeof obj !== 'object') {
			return obj
		}

		if (seen.has(obj)) {
			return '[Circular]'
		}

		seen.set(obj, true)

		if (typeof obj.toJSON === 'function') {
			try {
				var fResult = visit(obj.toJSON())
				seen.delete(obj)
				return fResult
			} catch(err) {
				seen.delete(obj)
				return throwsMessage(err)
			}
		}

		if (Array.isArray(obj)) {
			var aResult = obj.map(visit)
			seen.delete(obj)
			return aResult
		}

		var result = Object.keys(obj).reduce(function(result, prop) {
			// prevent faulty defined getter properties
			result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop))
			return result
		}, {})
		seen.delete(obj)
		return result
	}

	return visit(obj)
}

function safeJson(data, replacer, space) {
	return JSON.stringify(ensureProperties(data), replacer, space)
}

safeJson.ensureProperties = ensureProperties

export default safeJson
