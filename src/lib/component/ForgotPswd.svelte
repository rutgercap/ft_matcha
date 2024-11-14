<script>
    import { createEventDispatcher } from 'svelte';

    export let username = "";
    export let email = "";

    const dispatch = createEventDispatcher();
	// Optionally, an event to close the popup
	const handleClose = () => {
		// Emit an event or update a reactive variable to close the popup
		console.log('in the handleClose in the child component')
	};
	// Add an event to handle the form submission
	const handleForgotPassword = (event) => {
        event.preventDefault();

        // Emit an event with form data
        dispatch('submitForgotPassword', { username, email });
    };
</script>

<div class="overlay" on:click={handleClose}></div>

<div class="popup">
    <h2>Forgot Password</h2>
    <form on:submit={handleForgotPassword}>
        <div class="input-group">
            <label for="username">Username</label>
            <input
                type="text"
                id="username"
                bind:value={username}
                placeholder="Enter your username"
                required
            />
        </div>

        <div class="input-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                bind:value={email}
                placeholder="Enter your email"
                required
            />
        </div>

        <button type="submit" class="submit-button">Submit</button>
        <button type="button" class="cancel-button" on:click={handleClose}>Cancel</button>
    </form>
</div>


<style>
    /* Basic styling for the popup */
    .popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        padding: 20px;
        background-color: white;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        z-index: 1000;
    }
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    .input-group {
        margin-bottom: 15px;
    }
    button {
        margin-top: 10px;
        padding: 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .submit-button {
        background-color: #007bff;
        color: white;
    }
    .cancel-button {
        background-color: #f0f0f0;
        color: black;
    }
</style>
