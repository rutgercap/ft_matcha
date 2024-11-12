<script>
	export let isOpen = false;
	export let onClose;

	// Close dialog when the overlay or close button is clicked
	const handleClose = () => {
	  if (onClose) onClose();
	};
  </script>

  {#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
	  <div class="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg relative">
		<button
		  class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
		  on:click={handleClose}
		>
		  &times;
		</button>
		<h2 class="text-2xl font-bold mb-4">Dialog Title</h2>
		<p>This is a dialog box content.</p>
		<button
		  class="mt-6 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-500"
		  on:click={handleClose}
		>
		  Close
		</button>
	  </div>
	</div>
  {/if}

  <style>
	/* Additional styling if desired */
  </style>
