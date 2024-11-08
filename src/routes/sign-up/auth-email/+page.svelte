

  <div class="relative isolate px-6 pt-14 lg:px-8">
	<!-- Your existing layout structure -->
	<div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
	  <div class="text-center">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
		  Email Verification Required
		</h1>
		<p class="mt-6 text-lg leading-8 text-gray-600">
		  We've sent a verification link to your email address.
		</p>
		<p class="mt-2 text-lg leading-8 text-gray-600">
		  Please check your inbox and follow the link to verify your email.
		</p>

		<div class="mt-10 flex items-center justify-center gap-x-6">
		  <a
			href="/"
			class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
		  >
			Return to Home
		  </a>

		  <!-- Resend Verification Link Button -->
			<form method="POST" action="?/resend">
				<button
				class="ml-4 rounded-md bg-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
				>
					Resend verification link
				</button>
			</form>
		</div>
	  </div>
	</div>
  </div>
