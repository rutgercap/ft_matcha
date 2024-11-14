<script>
    import { createEventDispatcher } from 'svelte';


    export let value;
    export let closeComponent;

    const dispatch = createEventDispatcher();

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the default form submission
        dispatch('submitForgotPassword'); // Emit the event with no additional data
    };

    const close = () => {
        closeComponent = false
    }
</script>

<div class="popup">
    <h2>Forgot Password</h2>
    <form on:submit={handleSubmit}>
        <div class="input-group">
            <label for="username">Username</label>
            <input
                type="text"
                id="username"
                bind:value={value.username}
                placeholder="Enter your username"
                required
            />
        </div>

        <div class="input-group">
            <label for="email">Email</label>
            <input
                type="email"
                id="email"
                bind:value={value.email}
                placeholder="Enter your email"
                required
            />
        </div>

        <button type="submit" class="submit-button">Submit</button>
        <button type="button" class="cancel-button" on:click={close}>Cancel</button>
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
