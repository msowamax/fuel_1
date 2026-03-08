const supabase = require('./supabase');

async function checkUserRole() {
    console.log("Checking Users and Roles...");
    const { data, error } = await supabase
        .from('users')
        .select('id, email, role, name');

    if (error) {
        console.error("Error fetching users:", error);
    } else {
        console.log("Users in DB:", JSON.stringify(data, null, 2));
    }
}

checkUserRole();
