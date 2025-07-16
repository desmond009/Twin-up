import { useState } from 'react';

const initialProfile = {
  name: '',
  location: '',
  photo: null,
  bio: '',
  skillsOffered: [],
  skillsWanted: [],
  availability: [],
  isPublic: true,
};

const AVAILABILITY_OPTIONS = [
  'Weekdays',
  'Weekends',
  'Mornings',
  'Afternoons',
  'Evenings',
];

export default function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [skillInput, setSkillInput] = useState({ offered: '', wanted: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'isPublic') {
      setProfile((p) => ({ ...p, isPublic: checked }));
    } else {
      setProfile((p) => ({ ...p, [name]: value }));
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setProfile((p) => ({ ...p, photo: file }));
  };

  const handleAvailability = (option) => {
    setProfile((p) => {
      const exists = p.availability.includes(option);
      return {
        ...p,
        availability: exists
          ? p.availability.filter((a) => a !== option)
          : [...p.availability, option],
      };
    });
  };

  const addSkill = (type) => {
    if (!skillInput[type].trim()) return;
    setProfile((p) => ({
      ...p,
      [type === 'offered' ? 'skillsOffered' : 'skillsWanted']:
        [...p[type === 'offered' ? 'skillsOffered' : 'skillsWanted'], skillInput[type].trim()],
    }));
    setSkillInput((s) => ({ ...s, [type]: '' }));
  };

  const removeSkill = (type, idx) => {
    setProfile((p) => ({
      ...p,
      [type]: p[type].filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="name"
            required
            value={profile.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Profile Photo</label>
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {profile.photo && (
            <img
              src={URL.createObjectURL(profile.photo)}
              alt="Profile Preview"
              className="mt-2 w-20 h-20 object-cover rounded-full border"
            />
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={profile.bio}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block font-medium mb-1">Skills Offered</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput.offered}
                onChange={(e) => setSkillInput((s) => ({ ...s, offered: e.target.value }))}
                className="flex-1 border rounded px-2 py-1"
                placeholder="Add skill"
              />
              <button type="button" onClick={() => addSkill('offered')} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Add</button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {profile.skillsOffered.map((skill, idx) => (
                <li key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill('skillsOffered', idx)} className="ml-1 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Skills Wanted</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput.wanted}
                onChange={(e) => setSkillInput((s) => ({ ...s, wanted: e.target.value }))}
                className="flex-1 border rounded px-2 py-1"
                placeholder="Add skill"
              />
              <button type="button" onClick={() => addSkill('wanted')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Add</button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {profile.skillsWanted.map((skill, idx) => (
                <li key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill('skillsWanted', idx)} className="ml-1 text-xs">✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Availability</label>
          <div className="flex flex-wrap gap-3">
            {AVAILABILITY_OPTIONS.map((option) => (
              <label key={option} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={profile.availability.includes(option)}
                  onChange={() => handleAvailability(option)}
                  className="accent-blue-500"
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-medium">Public Profile</label>
          <input
            type="checkbox"
            name="isPublic"
            checked={profile.isPublic}
            onChange={handleChange}
            className="accent-blue-500"
          />
          <span className="text-gray-500 text-sm">{profile.isPublic ? 'Visible to others' : 'Private'}</span>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
