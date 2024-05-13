import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Preferences() {
    const location = useLocation();
    const navigate = useNavigate();
    const username = location.state.username;

    const [target_age_min, setTargetAgeMin] = useState('');
    const [target_age_max, setTargetAgeMax] = useState('');
    // const [target_sex, setTargetSex] = useState('');
    const [target_sex, setTargetSex] = useState([]);
    const [target_status, setTargetStatus] = useState('');
    const [target_orientation, setTargetOrientation] = useState('');
    const [target_drinks, setTargetDrinks] = useState('');
    const [target_drugs, setTargetDrugs] = useState('');
    const [target_ethnicity, setTargetEthnicity] = useState('');
    const [target_height, setTargetHeight] = useState('');
    const [target_income, setTargetIncome] = useState('');
    const [target_offspring, setTargetOffspring] = useState('');
    const [target_pets, setTargetPets] = useState('');
    const [target_religion, setTargetReligion] = useState('');
    const [target_smokes, setTargetSmokes] = useState('');

    const [responseMessage, setResponseMessage] = useState('');
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/user/${username}`);
                const { success, user } = response.data;

                if (success) {
                    setTargetAgeMin(user.target_age_min || '');
                    setTargetAgeMax(user.target_age_max || '');
                    // setTargetSex(JSON.parse(user.target_sex || ''));
                    setTargetSex(user.target_sex || ''); // Updated line
                    setTargetStatus(JSON.parse(user.target_status || '[]'));
                    setTargetOrientation(JSON.parse(user.target_orientation || '[]'));
                    setTargetDrinks(JSON.parse(user.target_drinks || '[]'));
                    setTargetDrugs(JSON.parse(user.target_drugs || '[]'));
                    setTargetEthnicity(JSON.parse(user.target_ethnicity || '[]'));
                    setTargetHeight(user.target_height || '');
                    setTargetIncome(user.target_income || '');
                    setTargetOffspring(JSON.parse(user.target_offspring || '[]'));
                    setTargetPets(JSON.parse(user.target_pets || '[]'));
                    setTargetReligion(JSON.parse(user.target_religion || '[]'));
                    setTargetSmokes(JSON.parse(user.target_smokes || '[]'));
                } else {
                    console.error('Failed to fetch user details');
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, [username]);

    const handleCheckboxChange = (value) => {
        // Check if the value is already in the state
        if (target_sex.includes(value)) {
            // If it is, remove it
            setTargetSex(target_sex.filter(item => item !== value));
        } else {
            // If it's not, add it
            setTargetSex([...target_sex, value]);
        }
    };

    const handleOrientationChange = (value) => {
        setTargetOrientation(prevOrientation => {
            const currentIndex = prevOrientation.indexOf(value);
            const newOrientation = [...prevOrientation];
    
            if (currentIndex === -1) {
                newOrientation.push(value); // value not in array, add it
            } else {
                newOrientation.splice(currentIndex, 1); // value in array, remove it
            }
    
            return newOrientation;
        });
    };
    

    const handleStatusChange = (value) => {
        setTargetStatus((prevStatus) => {
            if (prevStatus.includes(value)) {
                return prevStatus.filter((item) => item !== value);
            } else {
                return [...prevStatus, value];
            }
        });
    };

    const handleDrinksChange = (value) => {
        setTargetDrinks((prevDrinks) => {
            if (prevDrinks.includes(value)) {
                return prevDrinks.filter((item) => item !== value);
            } else {
                return [...prevDrinks, value];
            }
        });
    };

    const handleDrugsChange = (value) => {
        setTargetDrugs((prevDrugs) => {
            if (prevDrugs.includes(value)) {
                return prevDrugs.filter((item) => item !== value);
            } else {
                return [...prevDrugs, value];
            }
        });
    };

    const handleEthnicityChange = (value) => {
        setTargetEthnicity((prevEthnicity) => {
            if (prevEthnicity.includes(value)) {
                return prevEthnicity.filter((item) => item !== value);
            } else {
                return [...prevEthnicity, value];
            }
        });
    };

    const handleOffspringChange = (value) => {
        setTargetOffspring((prevOffspring) => {
            if (prevOffspring.includes(value)) {
                return prevOffspring.filter((item) => item !== value);
            } else {
                return [...prevOffspring, value];
            }
        });
    };

    const handlePetsChange = (value) => {
        setTargetPets((prevPets) => {
            if (prevPets.includes(value)) {
                return prevPets.filter((item) => item !== value);
            } else {
                return [...prevPets, value];
            }
        });
    };

    const handleReligionChange = (value) => {
        setTargetReligion((prevReligion) => {
            if (prevReligion.includes(value)) {
                return prevReligion.filter((item) => item !== value);
            } else {
                return [...prevReligion, value];
            }
        });
    };

    const handleSmokesChange = (value) => {
        setTargetSmokes((prevSmokes) => {
            if (prevSmokes.includes(value)) {
                return prevSmokes.filter((item) => item !== value);
            } else {
                return [...prevSmokes, value];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/preference', {
                username,
                target_age_min,
                target_age_max,
                target_sex,
                target_status,
                target_orientation,
                target_drinks,
                target_drugs,
                target_ethnicity,
                target_height,
                target_income,
                target_offspring,
                target_pets,
                target_religion,
                target_smokes
            });

            const { success, message } = response.data;

            // Update response message state
            setResponseMessage(message);

            // Show dialog box based on the response
            if (success) {
                window.alert('Congratulations, We got your preferences!');
                navigate('/main', { state: { username } });

            } else {
                window.alert('Facing some issue in saving the preferences.');
            }
        } catch (error) {
            console.error('Error:', error);
            setResponseMessage('Error occurred. Please try again.'); // Set error message
        }
    };

    return (
        <div className="join-container">
            <h1>Who are you looking for, {username}?</h1>
            <form onSubmit={handleSubmit}>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="field" style={{ display: "flex", alignItems: "center" }}>
                        <label htmlFor="target_sex" style={{ marginRight: "10px" }}>Gender<span>*</span>:</label>
                        <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Male"
                                    name="target_sex"
                                    value="Male"
                                    checked={target_sex.includes('Male')}
                                    onChange={() => handleCheckboxChange('Male')}
                                />
                                <label htmlFor="Male" style={{ fontSize: "0.9em" }}>Male</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Female"
                                    name="target_sex"
                                    value="Female"
                                    checked={target_sex.includes('Female')}
                                    onChange={() => handleCheckboxChange('Female')}
                                />
                                <label htmlFor="Female" style={{ fontSize: "0.9em" }}>Female</label>
                            </li>
                            <li>
                                <input
                                    type="checkbox"
                                    id="Nonbinary"
                                    name="target_sex"
                                    value="Nonbinary"
                                    checked={target_sex.includes('Nonbinary')}
                                    onChange={() => handleCheckboxChange('Nonbinary')}
                                />
                                <label htmlFor="Nonbinary" style={{ fontSize: "0.9em" }}>Nonbinary</label>
                            </li>
                        </ul>
                    </div>
                </div>


                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                    <div className="field" style={{ display: "flex", alignItems: "center" }}>
                        <label htmlFor="age_range" style={{ marginRight: "10px" }}>Age Range<span>*</span>:</label>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <input
                                type="number"
                                id="target_age_min"
                                value={target_age_min}
                                onChange={(e) => setTargetAgeMin(e.target.value)}
                                min="18"
                                placeholder="Min"
                                style={{ marginRight: "10px" }}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                id="target_age_max"
                                value={target_age_max}
                                onChange={(e) => setTargetAgeMax(e.target.value)}
                                min={target_age_min} // Ensure max age is greater than or equal to min age
                                placeholder="Max"
                                style={{ marginLeft: "10px" }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="field" style={{ display: "flex", alignItems: "center" }}>
                        <label htmlFor="orientation" style={{ marginRight: "10px" }}>Orientation<span>*</span>:</label>
                        <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Straight"
                                    value="Straight"
                                    checked={target_orientation.includes('Straight')}
                                    onChange={(e) => handleOrientationChange(e.target.value)}
                                />
                                <label htmlFor="Straight" style={{ fontSize: "0.9em" }}>Straight</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Gay"
                                    value="Gay"
                                    checked={target_orientation.includes('Gay')}
                                    onChange={(e) => handleOrientationChange(e.target.value)}
                                />
                                <label htmlFor="Gay" style={{ fontSize: "0.9em" }}>Gay</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Bisexual"
                                    value="Bisexual"
                                    checked={target_orientation.includes('Bisexual')}
                                    onChange={(e) => handleOrientationChange(e.target.value)}
                                />
                                <label htmlFor="Bisexual" style={{ fontSize: "0.9em" }}>Bisexual</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Lesbian"
                                    value="Lesbian"
                                    checked={target_orientation.includes('Lesbian')}
                                    onChange={(e) => handleOrientationChange(e.target.value)}
                                />
                                <label htmlFor="Lesbian" style={{ fontSize: "0.9em" }}>Lesbian</label>
                            </li>
                            <li>
                                <input
                                    type="checkbox"
                                    id="Asexual"
                                    value="Asexual"
                                    checked={target_orientation.includes('Asexual')}
                                    onChange={(e) => handleOrientationChange(e.target.value)}
                                />
                                <label htmlFor="Asexual" style={{ fontSize: "0.9em" }}>Asexual</label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div className="field" style={{ display: "flex", alignItems: "center" }}>
                        <label htmlFor="status" style={{ marginRight: "10px" }}>Status<span>*</span>:</label>
                        <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Single"
                                    value="Single"
                                    checked={target_status.includes('Single')}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                />
                                <label htmlFor="Single" style={{ fontSize: "0.9em" }}>Single</label>
                            </li>
                            <li style={{ marginRight: "10px" }}>
                                <input
                                    type="checkbox"
                                    id="Seeing Someone"
                                    value="Seeing Someone"
                                    checked={target_status.includes('Seeing Someone')}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                />
                                <label htmlFor="Seeing Someone" style={{ fontSize: "0.9em" }}>Seeing Someone</label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <label htmlFor="drinks" style={{ marginRight: "10px" }}>Drinks:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Socially"
                                value="Socially"
                                checked={target_drinks.includes('Socially')}
                                onChange={(e) => handleDrinksChange(e.target.value)}
                            />
                            <label htmlFor="Socially" style={{ fontSize: "0.9em" }}>Socially</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Often"
                                value="Often"
                                checked={target_drinks.includes('Often')}
                                onChange={(e) => handleDrinksChange(e.target.value)}
                            />
                            <label htmlFor="Often" style={{ fontSize: "0.9em" }}>Often</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Not at all"
                                value="Not at all"
                                checked={target_drinks.includes('Not at all')}
                                onChange={(e) => handleDrinksChange(e.target.value)}
                            />
                            <label htmlFor="Not at all" style={{ fontSize: "0.9em" }}>Not at all</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Rarely"
                                value="Rarely"
                                checked={target_drinks.includes('Rarely')}
                                onChange={(e) => handleDrinksChange(e.target.value)}
                            />
                            <label htmlFor="Rarely" style={{ fontSize: "0.9em" }}>Rarely</label>
                        </li>
                    </ul>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <label htmlFor="drugs" style={{ marginRight: "10px" }}>Drugs:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Never"
                                value="Never"
                                checked={target_drugs.includes('Never')}
                                onChange={(e) => handleDrugsChange(e.target.value)}
                            />
                            <label htmlFor="Never" style={{ fontSize: "0.9em" }}>Never</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Sometimes"
                                value="Sometimes"
                                checked={target_drugs.includes('Sometimes')}
                                onChange={(e) => handleDrugsChange(e.target.value)}
                            />
                            <label htmlFor="Sometimes" style={{ fontSize: "0.9em" }}>Sometimes</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Often"
                                value="Often"
                                checked={target_drugs.includes('Often')}
                                onChange={(e) => handleDrugsChange(e.target.value)}
                            />
                            <label htmlFor="Often" style={{ fontSize: "0.9em" }}>Often</label>
                        </li>
                    </ul>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <label htmlFor="ethnicity" style={{ marginRight: "10px" }}>Ethnicity:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Asian"
                                value="Asian"
                                checked={target_ethnicity.includes('Asian')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="Asian" style={{ fontSize: "0.9em" }}>Asian</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="American"
                                value="American"
                                checked={target_ethnicity.includes('American')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="American" style={{ fontSize: "0.9em" }}>American</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Hispanic/Latino"
                                value="Hispanic/Latino"
                                checked={target_ethnicity.includes('Hispanic/Latino')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="Hispanic/Latino" style={{ fontSize: "0.9em" }}>Hispanic/Latino</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Black"
                                value="Black"
                                checked={target_ethnicity.includes('Black')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="Black" style={{ fontSize: "0.9em" }}>Black</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="White"
                                value="White"
                                checked={target_ethnicity.includes('White')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="White " style={{ fontSize: "0.9em" }}>White</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Other"
                                value="Other"
                                checked={target_ethnicity.includes('Other')}
                                onChange={(e) => handleEthnicityChange(e.target.value)}
                            />
                            <label htmlFor="Other" style={{ fontSize: "0.9em" }}>Other</label>
                        </li>
                    </ul>
                </div>

                <div className="field" style={{ marginTop: "20px" }}>
                    <label htmlFor="height">Height:</label>
                    <input
                        type="number"
                        id="target_height"
                        value={target_height}
                        onChange={(e) => setTargetHeight(e.target.value)}
                    />
                    <span style={{ marginLeft: "5px" }}>(in cm)</span>
                </div>

                <div className="field" style={{ marginTop: "40px" }}>
                    <label htmlFor="income">Income:</label>
                    <input
                        type="number"
                        id="target_income"
                        value={target_income}
                        onChange={(e) => setTargetIncome(e.target.value)}
                    />
                    <span style={{ marginLeft: "5px" }}>(in $ per annum)</span>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <label htmlFor="offspring" style={{ marginRight: "10px" }}>Offspring:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Doesn't want kids"
                                value="Doesn't want kids"
                                onChange={(e) => handleOffspringChange(e.target.value)}
                            />
                            <label htmlFor="Doesn't want kids" style={{ fontSize: "0.9em" }}>Doesn't want kids</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Want kids"
                                value="Want kids"
                                onChange={(e) => handleOffspringChange(e.target.value)}
                            />
                            <label htmlFor="Want kids" style={{ fontSize: "0.9em" }}>Want kids</label>
                        </li>
                    </ul>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
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

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <label htmlFor="smokes" style={{ marginRight: "10px" }}>Smokes:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Often"
                                value="Often"
                                onChange={(e) => handleSmokesChange(e.target.value)}
                            />
                            <label htmlFor="Often" style={{ fontSize: "0.9em" }}>Often</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Not at all"
                                value="Not at all"
                                onChange={(e) => handleSmokesChange(e.target.value)}
                            />
                            <label htmlFor="Not at all" style={{ fontSize: "0.9em" }}>Not at all</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Rarely"
                                value="Rarely"
                                onChange={(e) => handleSmokesChange(e.target.value)}
                            />
                            <label htmlFor="Rarely" style={{ fontSize: "0.9em" }}>Rarely</label>
                        </li>
                    </ul>
                </div>

                <div className="field categorical" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <label htmlFor="religion" style={{ marginRight: "10px" }}>Religion:</label>
                    <ul className="options" style={{ display: "flex", listStyle: "none", padding: 0 }}>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Buddhist"
                                value="Buddhist"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Buddhist" style={{ fontSize: "0.9em" }}>Buddhist</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Sikh"
                                value="Sikh"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Sikh" style={{ fontSize: "0.9em" }}>Sikh</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Catholic"
                                value="Catholic"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Catholic" style={{ fontSize: "0.9em" }}>Catholic</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Christian"
                                value="Christian"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Christian" style={{ fontSize: "0.9em" }}>Christian</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Hindu"
                                value="Hindu"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Hindu" style={{ fontSize: "0.9em" }}>Hindu</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Jewish"
                                value="Jewish"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Jewish" style={{ fontSize: "0.9em" }}>Jewish</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Muslim"
                                value="Muslim"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Muslim" style={{ fontSize: "0.9em" }}>Muslim</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Spiritual"
                                value="Spiritual"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Spiritual" style={{ fontSize: "0.9em" }}>Spiritual</label>
                        </li>
                        <li style={{ marginRight: "10px" }}>
                            <input
                                type="checkbox"
                                id="Agnostic"
                                value="Agnostic"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Agnostic" style={{ fontSize: "0.9em" }}>Agnostic</label>
                        </li>
                        <li>
                            <input
                                type="checkbox"
                                id="Atheist"
                                value="Atheist"
                                onChange={(e) => handleReligionChange(e.target.value)}
                            />
                            <label htmlFor="Atheist" style={{ fontSize: "0.9em" }}>Atheist</label>
                        </li>
                    </ul>
                </div>

                <button type="submit">Join</button>
            </form>
        </div>
    );
}

export default Preferences;