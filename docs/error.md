at tests/Feature/DashboardTest.php:26
     22▕         $user = User::factory()->create();
     23▕         $this->actingAs($user);
     24▕
     25▕         $this->get(route('dashboard'))
  ➜  26▕             ->assertOk()
     27▕             ->assertInertia(fn (Assert $page) => $page
     28▕                 ->component('dashboard')
     29▕                 ->where('isCashier', true)
     30▕                 ->missing('chartData')


  Tests:    1 failed, 17 skipped, 24 passed (81 assertions)
  Duration: 5.00s