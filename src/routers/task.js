const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
  // const task = new Task(req.body)
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch {
    res.status(400).send(error)
  }
})

//'match' query for 'completed' field
router.get('/tasks', auth, async (req, res) => {

  const match = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  const sort = {}

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')

    sort['createdAt'] = (parts[1] === 'desc' ? -1 : 1)
  }

  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch {
    res.status(500).send(error)
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    // Limit the task to the user that created it
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const alllowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => alllowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'invalid operation' })
  }

  try {
    //find task by id and owner and update it 
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()

    res.send(task)

  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    //find task by id and owner and delete it

    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch {
    res.status(500).send()
  }
})

module.exports = router