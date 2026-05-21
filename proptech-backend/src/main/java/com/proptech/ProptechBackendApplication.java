package com.proptech;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.proptech.entity.Role;
import com.proptech.entity.User;
import com.proptech.entity.Role.ERole;
import com.proptech.repository.RoleRepository;
import com.proptech.repository.UserRepository;

import java.util.HashSet;
import java.util.Set;
@SpringBootApplication
@EnableJpaAuditing
public class ProptechBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProptechBackendApplication.class, args);
	}
	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository,
								   RoleRepository roleRepository,
								   PasswordEncoder passwordEncoder) {
		return args -> {
			createRoleIfNotFound(roleRepository, ERole.ROLE_USER);
			createRoleIfNotFound(roleRepository, ERole.ROLE_REALTOR);
			createRoleIfNotFound(roleRepository, ERole.ROLE_ADMIN);

			if (!userRepository.existsByEmail("admin@gmail.com")) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setEmail("admin@gmail.com");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setFullName("System Administrator");

				Set<Role> roles = new HashSet<>();
				Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
						.orElseThrow(() -> new RuntimeException("Error: Admin Role is not found."));
				roles.add(adminRole);
				admin.setRoles(roles);

				userRepository.save(admin);

				System.out.println("Admin user created successfully!");
			} else {
				System.out.println("Admin user already exists!");
			}
		};
	}

	private void createRoleIfNotFound(RoleRepository roleRepository, ERole roleName) {
		if (roleRepository.findByName(roleName).isEmpty()) {
			Role role = new Role();
			role.setName(roleName);
			roleRepository.save(role);
			System.out.println("Created role: " + roleName);
		}
	}
}
