const Photo = require('../models/photo.model');
const Voter = require('../models/Voter.model');
const { escape } = require('../utils/utils');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    const regex = /(.jpg|.jpeg|.png)$/i;
    const match = file.path.split('/').slice(-1)[0].match(regex);

    if (
      match &&
      title &&
      author &&
      email &&
      file &&
      title.length <= 25 &&
      author.length <= 50
    ) {
      // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({
        title: escape(title),
        author: escape(author),
        email,
        src: fileName,
        votes: 0,
      });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const foundVoter = await Voter.findOne({ user: { $eq: req.clientIp } });
    if (!foundVoter) {
      const voter = new Voter({ user: req.clientIp, votes: [req.params.id] });
      voter.save();
    } else if (foundVoter.votes.includes(req.params.id)) {
      throw new Error('The voter has already voted for this photo!', 500);
    } else {
      foundVoter.votes.push(req.params.id);
      foundVoter.save();
    }
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
