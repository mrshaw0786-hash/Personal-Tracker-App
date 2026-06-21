import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  // Strength — beginner-friendly compound + accessory
  { name: "Goblet Squat", muscleGroup: "Legs", category: "strength", level: "beginner", instructions: "Hold a dumbbell at chest height. Sit back and down keeping chest tall, drive through heels to stand.", defaultSets: 3, defaultReps: "12", restSec: 75 },
  { name: "Push-Up", muscleGroup: "Chest", category: "strength", level: "beginner", instructions: "Hands slightly wider than shoulders, body in a straight line. Lower chest to floor, press back up. Drop to knees to scale.", defaultSets: 3, defaultReps: "10", restSec: 60 },
  { name: "Dumbbell Bench Press", muscleGroup: "Chest", category: "strength", level: "intermediate", instructions: "Lie on a bench, press dumbbells from chest to lockout, control the descent.", defaultSets: 4, defaultReps: "8", restSec: 90 },
  { name: "Barbell Back Squat", muscleGroup: "Legs", category: "strength", level: "intermediate", instructions: "Bar on upper back, brace core, squat to parallel, drive up.", defaultSets: 4, defaultReps: "6", restSec: 120 },
  { name: "Deadlift", muscleGroup: "Back", category: "strength", level: "advanced", instructions: "Hinge at hips, flat back, drive the floor away. Keep the bar close.", defaultSets: 4, defaultReps: "5", restSec: 150 },
  { name: "Bent-Over Row", muscleGroup: "Back", category: "strength", level: "intermediate", instructions: "Hinge forward, pull the bar/dumbbells to your waist, squeeze the shoulder blades.", defaultSets: 4, defaultReps: "10", restSec: 75 },
  { name: "Overhead Press", muscleGroup: "Shoulders", category: "strength", level: "intermediate", instructions: "Press the weight overhead from shoulder height, brace the core, lock out.", defaultSets: 3, defaultReps: "8", restSec: 90 },
  { name: "Romanian Deadlift", muscleGroup: "Hamstrings", category: "strength", level: "intermediate", instructions: "Slight knee bend, push hips back, lower the weight along the legs, feel the stretch, return.", defaultSets: 3, defaultReps: "10", restSec: 90 },
  { name: "Lunge", muscleGroup: "Legs", category: "strength", level: "beginner", instructions: "Step forward, lower the back knee toward the floor, push back to standing. Alternate legs.", defaultSets: 3, defaultReps: "12", restSec: 60 },
  { name: "Plank", muscleGroup: "Core", category: "strength", level: "beginner", instructions: "Forearms down, body in a straight line, brace the core. Hold for time.", defaultSets: 3, defaultReps: "45s", restSec: 45 },
  { name: "Dumbbell Curl", muscleGroup: "Arms", category: "strength", level: "beginner", instructions: "Curl the dumbbells with control, no swinging, squeeze at the top.", defaultSets: 3, defaultReps: "12", restSec: 60 },
  { name: "Tricep Dip", muscleGroup: "Arms", category: "strength", level: "beginner", instructions: "Hands on a bench behind you, lower the body by bending the elbows, press back up.", defaultSets: 3, defaultReps: "12", restSec: 60 },
  { name: "Lat Pulldown", muscleGroup: "Back", category: "strength", level: "beginner", instructions: "Pull the bar to your upper chest, drive the elbows down, control the return.", defaultSets: 3, defaultReps: "12", restSec: 75 },
  { name: "Hip Thrust", muscleGroup: "Glutes", category: "strength", level: "intermediate", instructions: "Upper back on a bench, drive through the heels to extend the hips, squeeze the glutes at the top.", defaultSets: 3, defaultReps: "12", restSec: 90 },

  // Cardio / fat loss
  { name: "Brisk Walk", muscleGroup: "Full Body", category: "cardio", level: "beginner", instructions: "Maintain a pace where you can talk but not sing. Great for recovery and step count.", defaultSets: 1, defaultReps: "30 min", restSec: 0 },
  { name: "Incline Treadmill Walk", muscleGroup: "Full Body", category: "cardio", level: "beginner", instructions: "Set a 6-10% incline at a moderate pace. Excellent low-impact fat burner.", defaultSets: 1, defaultReps: "25 min", restSec: 0 },
  { name: "Jump Rope", muscleGroup: "Full Body", category: "cardio", level: "intermediate", instructions: "Light bounces on the balls of the feet. Intervals of 60s on, 30s off.", defaultSets: 6, defaultReps: "60s", restSec: 30 },
  { name: "HIIT Intervals", muscleGroup: "Full Body", category: "cardio", level: "advanced", instructions: "30s all-out effort (bike, row, or sprint) followed by 60s easy. Repeat.", defaultSets: 8, defaultReps: "30s", restSec: 60 },
  { name: "Cycling", muscleGroup: "Legs", category: "cardio", level: "beginner", instructions: "Steady-state ride at a conversational effort.", defaultSets: 1, defaultReps: "30 min", restSec: 0 },

  // Mobility
  { name: "Cat-Cow", muscleGroup: "Spine", category: "mobility", level: "beginner", instructions: "On all fours, alternate between arching and rounding the spine with the breath.", defaultSets: 2, defaultReps: "10", restSec: 20 },
  { name: "World's Greatest Stretch", muscleGroup: "Full Body", category: "mobility", level: "beginner", instructions: "Lunge, drop the elbow inside the front foot, then rotate the same arm to the ceiling.", defaultSets: 2, defaultReps: "6/side", restSec: 20 },
  { name: "Hip Flexor Stretch", muscleGroup: "Hips", category: "mobility", level: "beginner", instructions: "Half-kneeling, tuck the pelvis and gently push the hips forward.", defaultSets: 2, defaultReps: "30s/side", restSec: 15 },

  // Recovery
  { name: "Foam Rolling", muscleGroup: "Full Body", category: "recovery", level: "beginner", instructions: "Slowly roll major muscle groups, pausing on tender spots for 20-30s.", defaultSets: 1, defaultReps: "10 min", restSec: 0 },
  { name: "Box Breathing", muscleGroup: "Nervous System", category: "recovery", level: "beginner", instructions: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Calms the nervous system before sleep.", defaultSets: 1, defaultReps: "5 min", restSec: 0 },
];

const meals = [
  // Breakfast
  { name: "Veggie Oats Bowl", type: "breakfast", pref: "vegetarian", calories: 380, protein: 18, carbs: 55, fat: 9 },
  { name: "Greek Yogurt & Berries", type: "breakfast", pref: "vegetarian", calories: 300, protein: 24, carbs: 32, fat: 6 },
  { name: "3-Egg Veggie Omelette", type: "breakfast", pref: "non-vegetarian", calories: 350, protein: 26, carbs: 8, fat: 24 },
  { name: "Tofu Scramble & Toast", type: "breakfast", pref: "vegan", calories: 360, protein: 22, carbs: 38, fat: 12 },
  { name: "Protein Smoothie", type: "breakfast", pref: "any", calories: 320, protein: 30, carbs: 35, fat: 6 },

  // Lunch
  { name: "Grilled Chicken & Rice Bowl", type: "lunch", pref: "non-vegetarian", calories: 520, protein: 45, carbs: 55, fat: 12 },
  { name: "Paneer & Quinoa Bowl", type: "lunch", pref: "vegetarian", calories: 500, protein: 30, carbs: 50, fat: 18 },
  { name: "Chickpea Buddha Bowl", type: "lunch", pref: "vegan", calories: 480, protein: 22, carbs: 62, fat: 14 },
  { name: "Tuna Salad Wrap", type: "lunch", pref: "non-vegetarian", calories: 430, protein: 35, carbs: 38, fat: 14 },
  { name: "Lentil & Veg Curry + Rice", type: "lunch", pref: "vegan", calories: 510, protein: 24, carbs: 70, fat: 10 },

  // Dinner
  { name: "Baked Salmon & Greens", type: "dinner", pref: "non-vegetarian", calories: 480, protein: 40, carbs: 18, fat: 26 },
  { name: "Chicken Stir-Fry", type: "dinner", pref: "non-vegetarian", calories: 460, protein: 42, carbs: 35, fat: 14 },
  { name: "Tofu & Veg Stir-Fry", type: "dinner", pref: "vegan", calories: 420, protein: 26, carbs: 40, fat: 16 },
  { name: "Rajma & Brown Rice", type: "dinner", pref: "vegetarian", calories: 470, protein: 22, carbs: 72, fat: 8 },
  { name: "Egg Curry & Roti", type: "dinner", pref: "non-vegetarian", calories: 450, protein: 28, carbs: 40, fat: 18 },

  // Snacks
  { name: "Apple & Peanut Butter", type: "snack", pref: "vegan", calories: 220, protein: 7, carbs: 28, fat: 11 },
  { name: "Handful of Almonds", type: "snack", pref: "vegan", calories: 180, protein: 6, carbs: 6, fat: 15 },
  { name: "Cottage Cheese Cup", type: "snack", pref: "vegetarian", calories: 150, protein: 20, carbs: 8, fat: 4 },
  { name: "Roasted Chickpeas", type: "snack", pref: "vegan", calories: 160, protein: 8, carbs: 24, fat: 4 },

  // Pre / post workout
  { name: "Banana & Coffee", type: "pre-workout", pref: "vegan", calories: 120, protein: 1, carbs: 28, fat: 0 },
  { name: "Rice Cakes & Honey", type: "pre-workout", pref: "vegetarian", calories: 150, protein: 2, carbs: 34, fat: 1 },
  { name: "Whey Protein Shake", type: "post-workout", pref: "vegetarian", calories: 160, protein: 30, carbs: 6, fat: 2 },
  { name: "Chicken & Sweet Potato", type: "post-workout", pref: "non-vegetarian", calories: 380, protein: 38, carbs: 40, fat: 7 },
  { name: "Soy Protein Shake", type: "post-workout", pref: "vegan", calories: 150, protein: 25, carbs: 8, fat: 3 },
];

async function main() {
  console.log("Seeding exercises...");
  for (const e of exercises) {
    await prisma.exercise.upsert({
      where: { name: e.name },
      update: e,
      create: e,
    });
  }
  console.log(`  ${exercises.length} exercises ready`);

  console.log("Seeding meals...");
  for (const m of meals) {
    await prisma.meal.upsert({
      where: { name: m.name },
      update: m,
      create: m,
    });
  }
  console.log(`  ${meals.length} meals ready`);

  console.log("Seed complete.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
