import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './JoinScreen.css';

function JoinScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [age, setAge] = useState('');
    const [sex, setSex] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('');
    const [orientation, setOrientation] = useState('');
    const [body_type, setbody_type] = useState('');
    const [diet, setDiet] = useState('');
    const [drinks, setDrinks] = useState('');
    const [drugs, setDrugs] = useState('');
    const [education, setEducation] = useState('');
    const [ethnicity, setEthnicity] = useState('');
    const [height, setHeight] = useState('');
    const [income, setIncome] = useState('');
    const [job, setJob] = useState('');
    const [offspring, setOffspring] = useState('');
    //const [pets, setPets] = useState('');
    const [pets, setPets] = useState([]);
    const [religion, setReligion] = useState('');
    const [sign, setSign] = useState('');
    const [smokes, setSmokes] = useState('');
    const [speaks, setSpeaks] = useState('');
    const [essay0, setEssay0] = useState('');
    const [essay1, setEssay1] = useState('');
    const [essay2, setEssay2] = useState('');
    const [essay3, setEssay3] = useState('');
    const [essay4, setEssay4] = useState('');
    const [essay5, setEssay5] = useState('');
    const [essay6, setEssay6] = useState('');
    const [essay7, setEssay7] = useState('');
    const [essay8, setEssay8] = useState('');
    const [essay9, setEssay9] = useState('');
    const [responseMessage, setResponseMessage] = useState('');

    const navigate = useNavigate(); // Import useNavigate hook

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const convertImageToBase64 = (image) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 string after comma
            reader.onerror = error => reject(error);
            reader.readAsDataURL(image);
        });
    };

    const handlePetsChange = (value) => {
        // Create a new array to hold the updated pets
        let updatedPets = [];

        // If pets state is not null or undefined, assign it to updatedPets
        if (pets) {
            updatedPets = [...pets];
        }

        // Check if the value is already selected
        const valueIndex = updatedPets.indexOf(value);

        if (valueIndex !== -1) {
            // If selected, remove it from the list
            updatedPets.splice(valueIndex, 1);
        } else {
            // If not selected, add it to the list
            updatedPets.push(value);
        }

        // Update the pets state with the updated array
        setPets(updatedPets);
    };


    const handleJoin = async (e) => {
        e.preventDefault();

        try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');

            // Format the date-time as per the requirement
            const lastOnline = `${year}-${month}-${day}-${hours}-${minutes}`;

            const imageData = image && await convertImageToBase64(image);

            const response = await axios.post('http://127.0.0.1:5000/join', {
                username,
                password,
                name,
                image: imageData,
                sex,
                age,
                location,
                status,
                orientation,
                body_type,
                diet,
                drinks,
                drugs,
                education,
                ethnicity,
                height,
                income,
                job,
                offspring,
                pets,
                religion,
                sign,
                smokes,
                speaks,
                essay0,
                essay1,
                essay2,
                essay3,
                essay4,
                essay5,
                essay6,
                essay7,
                essay8,
                essay9,
                last_online: lastOnline
            });

            const { success, message } = response.data;

            // Update response message state
            setResponseMessage(message);

            // Show dialog box based on the response
            if (success) {
                window.alert('Congratulations, You have been registered!');
                navigate('/preferences', { state: { username } });
                //navigate('/main'); // Navigate to MainScreen
            } else {
                window.alert('A user with similar details already exists.');
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('Error occurred. Please try again.'); // Set error message
        }
    };

    return (
        <div className="join-container">
            <h1>Join HeartSync</h1>
            <form onSubmit={handleJoin}>
                <div>
                    <label htmlFor="username">Username<span style={{ color: 'black' }}>*</span>:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}></div>

                <div>
                    <label htmlFor="password">Password<span style={{ color: 'black' }}>*</span>:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}></div>

                <div>
                    <label htmlFor="name">Name<span style={{ color: 'black' }}>*</span>:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '20px' }}></div>

                <div>
                    <label htmlFor="image">Image:*</label>
                    <input required type="file" id="image" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="field" style={{ display: "flex", alignItems: "center" }}>
                        <label htmlFor="sex" style={{ marginRight: "10px" }}>Gender<span>*</span>:</label>
                        <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                            <li style={{ marginRight: "10px" }}>
                                <input type="radio" id="male" name="sex" value="male" onChange={(e) => setSex(e.target.value)} required />
                                <label htmlFor="male" style={{ fontSize: "0.9em" }}>Male</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input type="radio" id="female" name="sex" value="female" onChange={(e) => setSex(e.target.value)} required />
                                <label htmlFor="female" style={{ fontSize: "0.9em" }}>Female</label>
                            </li>
                            <li>
                                <input type="radio" id="nonbinary" name="sex" value="nonbinary" onChange={(e) => setSex(e.target.value)} required />
                                <label htmlFor="nonbinary" style={{ fontSize: "0.9em" }}>Nonbinary</label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div>
                    <div className="field">
                        <label htmlFor="age">Age<span>*</span> <span style={{ fontSize: "0.6em" }}>(Should be greater than 18)</span>:</label>
                        <input
                            type="number"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            required
                            min="18"
                        />
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <div className="field">
                            <label htmlFor="location">Location<span>*</span>:</label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="field" style={{ display: "flex", alignItems: "center" }}>
                    <label htmlFor="orientation"  style={{ marginRight: "10px" }}>Orientation<span>*</span>:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input type="radio" id="Straight" name="orientation" value="Straight" onChange={(e) => setOrientation(e.target.value)} required />
                            <label htmlFor="Straight" style={{ fontSize: "0.9em" }}>Straight</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input type="radio" id="Gay" name="orientation" value="Gay" onChange={(e) => setOrientation(e.target.value)} required />
                            <label htmlFor="Gay" style={{ fontSize: "0.9em" }}>Gay</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input type="radio" id="Bisexual" name="orientation" value="Bisexual" onChange={(e) => setOrientation(e.target.value)} required />
                            <label htmlFor="Bisexual" style={{ fontSize: "0.9em" }}>Bisexual</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input type="radio" id="Lesbian" name="orientation" value="Lesbian" onChange={(e) => setOrientation(e.target.value)} required />
                            <label htmlFor="Lesbian" style={{ fontSize: "0.9em" }}>Lesbian</label>
                        </li>
                        <li>
                            <input type="radio" id="Asexual" name="orientation" value="Asexual" onChange={(e) => setOrientation(e.target.value)} required />
                            <label htmlFor="Asexual" style={{ fontSize: "0.9em" }}>Asexual</label>
                        </li>
                    </ul>
                </div>

                <div>
                    <div className="field">
                        <label htmlFor="status">Status<span>*</span>:</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                        >
                            <option value="">--Select--</option>
                            <option value="Single">Single</option>
                            <option value="Seeing Someone">Seeing Someone</option>
                            </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="body_type" style={{ marginRight: "10px" }}>Body Type:</label>
                        <select
                            id="body_type"
                            value={body_type}
                            onChange={(e) => setbody_type(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="A Little Extra">A Little Extra</option>
                            <option value="Average">Average</option>
                            <option value="Thin">Thin</option>
                            <option value="Athletic">Athletic</option>
                            <option value="Fit">Fit</option>
                            <option value="Skinny">Skinny</option>
                            <option value="Curvy">Curvy</option>
                            <option value="Full Figured">Full Figured</option>
                            <option value="Jacked">Jacked</option>
                            <option value="Prefer Not To Say">Prefer Not to Say</option>
                            <option value="Overweight">Overweight</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="diet" style={{ marginRight: "10px" }}>Diet:</label>
                        <select
                            id="diet"
                            value={diet}
                            onChange={(e) => setDiet(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Anything">Anything</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Other">Other</option>
                            <option value="Only Chicken">Only Chicken</option>
                            <option value="Halal">Halal</option>
                            <option value="Kosher">Kosher</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="drinks" style={{ marginRight: "10px" }}>Drinks:</label>
                        <select
                            id="drinks"
                            value={drinks}
                            onChange={(e) => setDrinks(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Socially">Socially</option>
                            <option value="Often">Often</option>
                            <option value="Not At All">Not at all</option>
                            <option value="Rarely">Rarely</option>
                        </select>
                    </div>


                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="drugs" style={{ marginRight: "10px" }}>Drugs:</label>
                        <select
                            id="drugs"
                            value={drugs}
                            onChange={(e) => setDrugs(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Never">Never</option>
                            <option value="Sometimes">Sometimes</option>
                            <option value="Often">Often</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="education" style={{ marginRight: "10px" }}>Education:</label>
                        <select
                            id="education"
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Graduate">Graduate</option>
                            <option value="High School">High School</option>
                            <option value="Prefer Not to Say">Prefer Not to Say</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="ethnicity" style={{ marginRight: "10px" }}>Ethnicity:</label>
                        <select
                            id="ethnicity"
                            value={ethnicity}
                            onChange={(e) => setEthnicity(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Asian">Asian</option>
                            <option value="American">American</option>
                            <option value="Hispanic/Latino">Hispanic/Latino</option>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="field" style={{ marginTop: "20px" }}>
                        <label htmlFor="height">Height:</label>
                        <input
                            type="number"
                            id="height"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                        <span style={{ marginLeft: "5px" }}>Inches</span>
                    </div>


                    <div className="field" style={{ marginTop: "20px" }}>
                        <label htmlFor="income">Income:</label>
                        <input
                            type="number"
                            id="income"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                        />
                        <span style={{ marginLeft: "5px" }}>$ per annum</span>
                    </div>


                    <div className="field" style={{ marginTop: "20px" }}>
                        <label htmlFor="job">Job:</label>
                        <input
                            type="text"
                            id="job"
                            value={job}
                            onChange={(e) => setJob(e.target.value)}
                        />
                    </div>


                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="offspring" style={{ marginRight: "10px" }}>Offspring:</label>
                        <select
                            id="offspring"
                            value={offspring}
                            onChange={(e) => setOffspring(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Doesn't want kids">Doesn't want kids</option>
                            <option value="Want kids">Want kids</option>
                        </select>
                    </div>

                    {/*<div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>*/}
                    {/*    <label htmlFor="pets" style={{ marginRight: "10px" }}>Pets:</label>*/}
                    {/*    <select*/}
                    {/*        id="pets"*/}
                    {/*        value={pets}*/}
                    {/*        onChange={(e) => setPets(e.target.value)}*/}
                    {/*        // required*/}
                    {/*    >*/}
                    {/*        <option value="">--Select--</option>*/}
                    {/*        <option value="Likes cats">Likes cats</option>*/}
                    {/*        <option value="Likes dogs">Likes dogs</option>*/}
                    {/*        <option value="Likes some other pet">Likes some other pet</option>*/}
                    {/*        <option value="Dislikes pets">Dislikes pets</option>*/}

                    {/*    </select>*/}
                    {/*</div>*/}

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="pets" style={{ marginRight: "10px" }}>Pets:</label>
                        <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Likes cats"
                                    value="Likes cats"
                                    onChange={(e) => handlePetsChange(e.target.value)}
                                />
                                <label htmlFor="Likes cats" style={{ fontSize: "0.9em" }}>Likes cats</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Likes dogs"
                                    value="Likes dogs"
                                    onChange={(e) => handlePetsChange(e.target.value)}
                                />
                                <label htmlFor="Likes dogs" style={{ fontSize: "0.9em" }}>Likes dogs</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Likes some other pet"
                                    value="Likes some other pet"
                                    onChange={(e) => handlePetsChange(e.target.value)}
                                />
                                <label htmlFor="Likes some other pet" style={{ fontSize: "0.9em" }}>Likes some other pet</label>
                            </li>
                            <li>
                                <input
                                    type="checkbox"
                                    id="Dislikes pets"
                                    value="Dislikes pets"
                                    onChange={(e) => handlePetsChange(e.target.value)}
                                />
                                <label htmlFor="Dislikes pets" style={{ fontSize: "0.9em" }}>Dislikes pets</label>
                            </li>
                        </ul>
                    </div>


                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="religion" style={{ marginRight: "10px" }}>Religion:</label>
                        <select
                            id="religion"
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Buddhist">Buddhist</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Catholic">Catholic</option>
                            <option value="Christian">Christian</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Jewish">Jewish</option>
                            <option value="Muslim">Muslim</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Agnostic">Agnostic</option>
                            <option value="Atheist">Atheist</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="sign" style={{ marginRight: "10px" }}>Sign:</label>
                        <select
                            id="sign"
                            value={sign}
                            onChange={(e) => setSign(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Aries">Aries</option>
                            <option value="Taurus">Taurus</option>
                            <option value="Gemini">Gemini</option>
                            <option value="Cancer">Cancer</option>
                            <option value="Leo">Leo</option>
                            <option value="Virgo">Virgo</option>
                            <option value="Libra">Libra</option>
                            <option value="Scorpio">Scorpio</option>
                            <option value="Sagittarius">Sagittarius</option>
                            <option value="Capricorn">Capricorn</option>
                            <option value="Aquarius">Aquarius</option>
                            <option value="Pisces">Pisces</option>
                        </select>
                    </div>

                    <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
                        <label htmlFor="smokes" style={{ marginRight: "10px" }}>Smokes:</label>
                        <select
                            id="smokes"
                            value={smokes}
                            onChange={(e) => setSmokes(e.target.value)}
                            // required
                        >
                            <option value="">--Select--</option>
                            <option value="Often">Often</option>
                            <option value="Not at all">Not at all</option>
                            <option value="Rarely">Rarely</option>
                        </select>
                    </div>

                    <div className="field" style={{ marginTop: "20px" }}>
                        <label htmlFor="speaks">Speaks:</label>
                        <input
                            type="text"
                            id="speaks"
                            value={speaks}
                            onChange={(e) => setSpeaks(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "20px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay0" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Tell us about yourself:</label>
                        <textarea
                            id="essay0"
                            value={essay0}
                            onChange={(e) => setEssay0(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "21px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay1" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Describe Your daily routine:</label>
                        <textarea
                            id="essay1"
                            value={essay1}
                            onChange={(e) => setEssay1(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "22px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay2" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>What are you good at:</label>
                        <textarea
                            id="essay2"
                            value={essay2}
                            onChange={(e) => setEssay2(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "23px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay3" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Describe your appearance:</label>
                        <textarea
                            id="essay3"
                            value={essay3}
                            onChange={(e) => setEssay3(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "24px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay4" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Describe your hobbies:</label>
                        <textarea
                            id="essay4"
                            value={essay4}
                            onChange={(e) => setEssay4(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "25px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay5" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Describe things you cannot live without:</label>
                        <textarea
                            id="essay5"
                            value={essay5}
                            onChange={(e) => setEssay5(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "26px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay6" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>What do you think about when idle:</label>
                        <textarea
                            id="essay6"
                            value={essay6}
                            onChange={(e) => setEssay6(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "31px", marginBottom: "4px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay7" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>What do you do on Friday evening:</label>
                        <textarea
                            id="essay7"
                            value={essay7}
                            onChange={(e) => setEssay7(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "35px", marginBottom: "4px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay8" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Tell us some interesting fact about you:</label>
                        <textarea
                            id="essay8"
                            value={essay8}
                            onChange={(e) => setEssay8(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px' }}></div>

                    <div className="field" style={{ marginTop: "39px", marginBottom: "1px", width: "50%", margin: "auto", display: "flex", alignItems: "center" }}>
                        <label htmlFor="essay9" style={{ marginRight: "20px", width: "40%", textAlign: "right", fontSize: "0.7em" }}>Who should swipe you right:</label>
                        <textarea
                            id="essay9"
                            value={essay9}
                            onChange={(e) => setEssay9(e.target.value)}
                            rows="4"
                            style={{ width: "60%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "vertical" }}
                        ></textarea>
                    </div>

                </div>

                <button type="submit">Join</button>
            </form>
        </div>
    );
}

export default JoinScreen;