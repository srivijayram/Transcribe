const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const audio = require('../models/audio')

// @desc    Show add page
// @route   GET /upload/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('upload/add')
})

// @desc    Process add form
// @route   POST /upload
router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await audio.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all upload
// @route   GET /upload
router.get('/', ensureAuth, async (req, res) => {
  try {
    const upload = await audio.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('upload/index', {
      upload,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single audio
// @route   GET /upload/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let audio = await audio.findById(req.params.id).populate('user').lean()

    if (!audio) {
      return res.render('error/404')
    }

    if (audio.user._id != req.user.id && audio.status == 'private') {
      res.render('error/404')
    } else {
      res.render('upload/show', {
        audio,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /upload/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const audio = await audio.findOne({
      _id: req.params.id,
    }).lean()

    if (!audio) {
      return res.render('error/404')
    }

    if (audio.user != req.user.id) {
      res.redirect('/upload')
    } else {
      res.render('upload/edit', {
        audio,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update audio
// @route   PUT /upload/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let audio = await audio.findById(req.params.id).lean()

    if (!audio) {
      return res.render('error/404')
    }

    if (audio.user != req.user.id) {
      res.redirect('/upload')
    } else {
      audio = await audio.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete audio
// @route   DELETE /upload/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let audio = await audio.findById(req.params.id).lean()

    if (!audio) {
      return res.render('error/404')
    }

    if (audio.user != req.user.id) {
      res.redirect('/upload')
    } else {
      await audio.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User upload
// @route   GET /upload/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const upload = await audio.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('upload/index', {
      upload,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

module.exports = router
