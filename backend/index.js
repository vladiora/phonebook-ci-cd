require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()

morgan.token('body', (request) => {

	if (request.method === 'POST')
		return JSON.stringify(request.body)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {

	response.send('<h1>Welcome to phonebook</h1>')
})

app.get('/api/persons', (request, response) => {

	Person.find({})
		.then(persons => {
			response.json(persons)
		})
})

app.get('/info', (request, response, next) => {

	const currTime = new Date()

	Person.estimatedDocumentCount({})
		.then(count => {
			response.send(`<p>Phonebook has info for ${count} people</p><p>${currTime}</p>`)
		})
		.catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {

	Person.findById(request.params.id)
		.then(person => {

			if (person) {

				response.json(person)
			} else {

				response.statusMessage = 'Person with this id does not exists'
				response.status(404).end()
			}
		})
		.catch(error => next(error))

})

app.delete('/api/persons/:id', (request, response, next) => {

	Person.findByIdAndDelete(request.params.id)
		.then(() => {
			response.status(204).end()
		})
		.catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {

	const person = request.body

	const newPerson = new Person({
		name: person.name,
		number: person.number
	})

	newPerson.save()
		.then(savedPerson => {
			response.json(savedPerson)
		})
		.catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {

	const { name, number } = request.body

	Person.findByIdAndUpdate(request.params.id, { name, number}, { new: true, runValidators: true, context: 'query' })
		.then(updatedPerson => {
			response.json(updatedPerson)
		})
		.catch(error => next(error))

})

const unknownEndpoint = (request, response) => {

	response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

	console.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	}

	next(error)
}

// handler for errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
