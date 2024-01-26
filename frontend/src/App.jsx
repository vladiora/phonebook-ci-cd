import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ( props ) => {

	return (
		<div>filter shown with: <input value={props.filter} onChange={props.onChangeFilter}/></div>
	)
}

const PersonForm = (props) => {

	return (
		<form onSubmit={props.addPerson} >
		<div>
			name: <input
				value={props.personName}
				onChange={props.onChangeName}
			/>
		</div>
		<div>
			number: <input
				value={props.personNumber}
				onChange={props.onChangeNumber}
			/></div>
		<div>
			<button type="submit">add</button>
		</div>
		</form>
	)
}

const Person = ({ person, deletePerson }) => {

	return (
		<div>
			{person.name} {person.number}
			<button onClick={deletePerson}>delete</button>
		</div>
	)
}

const Notification = ({ message, type }) => {

	if (message === null) {
		return null
	}

	return (
		<div className={type}>
			{message}
		</div>
	)
}

const App = () => {

	const [persons, setPersons] = useState([])
	const [newPerson, setNewPerson] = useState({name: '', number: ''})
	const [filter, setFilter] = useState('');
	const [notification, setNotification] = useState({message: null, type: ''})

	const hook = () => {
		personService
			.getAll()
			.then(initialPersons => {
				setPersons(initialPersons)
			})
	}

	useEffect(hook, [])

	const addPerson = (event) => {

		event.preventDefault()

		if (persons.some(person => person.name === newPerson.name)) {

			if (window.confirm(`${newPerson.name} is already added to phonebook, replace the old number with a new one?`)) {

				const person = persons.find(p => p.name === newPerson.name)
				const changedPerson = { ... person, number: newPerson.number }

				personService
					.update(person.id, changedPerson)
					.then(returnedPerson => {

						setNotification({
							message: `Changed number for ${returnedPerson.name}`,
							type: 'success'
						})

						setTimeout(() => {
							setNotification({
								message: null,
								type: ''
							})
						}, 5000)

						setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson))
						setNewPerson({name: '', number: ''})
					})
			}

			return
		}

		const personObject = {
			name: newPerson.name,
			number: newPerson.number
		}

		personService
			.create(personObject)
			.then(returnedPerson => {

				setNotification({
					message: `Added ${returnedPerson.name}`,
					type: 'success'
				})

				setTimeout(() => {
					setNotification({
						message: null,
						type: ''
					})
				}, 5000)

				setPersons(persons.concat(returnedPerson))
				setNewPerson({name: '', number: ''})
			})
			.catch(error => {

				setNotification({
					message: error.response.data.error,
					type: 'error'
				})
			})
	}

	const onChangeName = function (event) {

		const newNumber = newPerson.number
		setNewPerson({name: event.target.value, number: newNumber})
	}

	const onChangeNumber = function (event) {

		const newName = newPerson.name
		setNewPerson({name: newName, number: event.target.value})
	}

	const deletePerson = (person) => {

		if (window.confirm(`Delete ${person.name}?`))
			personService
				.remove(person.id)
				.then(() => setPersons(persons.filter(p => p.id !== person.id)))
				.catch(() => {

					setNotification({
						message: `Information of ${person.name} has already been removed from server`,
						type: 'error'
					})

					setTimeout(() => {
						setNotification({
							message: null,
							type: ''
						})
					}, 5000)

					setPersons(persons.filter(p => p.id !== person.id))
				})

	}

	const personsToShow = persons.filter(person => person.name.toLowerCase().includes(filter.toLowerCase()));

	return (
	<div>

		<h2>Phonebook</h2>
		<Notification message={notification.message} type={notification.type} />
		<Filter filter={filter} onChangeFilter={(event) => {setFilter(event.target.value)}} />

		<h3>add a new</h3>
		<PersonForm addPerson={addPerson} personName={newPerson.name} onChangeName={onChangeName} personNumber={newPerson.number} onChangeNumber={onChangeNumber} />

		<h3>Numbers</h3>
		{personsToShow.map(person =>
			<Person key={person.id} person={person} deletePerson={() => deletePerson(person)} />
		)}

	</div>
	)
}

export default App
