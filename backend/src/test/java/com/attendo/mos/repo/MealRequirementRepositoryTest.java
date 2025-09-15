package com.attendo.mos.repo;

import com.attendo.mos.entity.MealRequirement;
import com.attendo.mos.entity.User;
import com.attendo.mos.dto.MealRequirementType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class MealRequirementRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MealRequirementRepository mealRequirementRepository;

    @Test
    void findByUserId_ShouldReturnRequirementsForSpecificUser() {
        // Given
        User user1 = createUser("User 1");
        User user2 = createUser("User 2");
        
        MealRequirement req1 = createMealRequirement(user1, "Laktosfri");
        MealRequirement req2 = createMealRequirement(user1, "Diabetesanpassad");
        MealRequirement req3 = createMealRequirement(user2, "Glutenfri");

        entityManager.persistAndFlush(user1);
        entityManager.persistAndFlush(user2);
        entityManager.persistAndFlush(req1);
        entityManager.persistAndFlush(req2);
        entityManager.persistAndFlush(req3);

        // When
        List<MealRequirement> user1Requirements = mealRequirementRepository.findByUserId(user1.getId());

        // Then
        assertThat(user1Requirements).hasSize(2);
        assertThat(user1Requirements).extracting(MealRequirement::getNotes)
            .containsExactlyInAnyOrder("Laktosfri", "Diabetesanpassad");
    }

    @Test
    void findByUserId_ShouldReturnEmptyListWhenUserHasNoRequirements() {
        // Given
        User user = createUser("User without requirements");
        entityManager.persistAndFlush(user);

        // When
        List<MealRequirement> requirements = mealRequirementRepository.findByUserId(user.getId());

        // Then
        assertThat(requirements).isEmpty();
    }

    @Test
    void deleteByUserId_ShouldDeleteAllRequirementsForUser() {
        // Given
        User user1 = createUser("User 1");
        User user2 = createUser("User 2");
        
        MealRequirement req1 = createMealRequirement(user1, "Laktosfri");
        MealRequirement req2 = createMealRequirement(user1, "Diabetesanpassad");
        MealRequirement req3 = createMealRequirement(user2, "Glutenfri");

        entityManager.persistAndFlush(user1);
        entityManager.persistAndFlush(user2);
        entityManager.persistAndFlush(req1);
        entityManager.persistAndFlush(req2);
        entityManager.persistAndFlush(req3);

        // When
        mealRequirementRepository.deleteByUserId(user1.getId());
        entityManager.flush();

        // Then
        List<MealRequirement> user1Requirements = mealRequirementRepository.findByUserId(user1.getId());
        List<MealRequirement> user2Requirements = mealRequirementRepository.findByUserId(user2.getId());
        
        assertThat(user1Requirements).isEmpty();
        assertThat(user2Requirements).hasSize(1);
        assertThat(user2Requirements.get(0).getNotes()).isEqualTo("Glutenfri");
    }

    private User createUser(String name) {
        User user = new User();
        // Don't set ID - let Hibernate generate it
        user.setDisplayName(name);
        user.setEmail(name.toLowerCase().replace(" ", ".") + "@example.com");
        user.setPasswordHash("dummy-hash");
        return user;
    }

    private MealRequirement createMealRequirement(User user, String notes) {
        MealRequirement requirement = new MealRequirement();
        requirement.setUser(user);
        requirement.setType(MealRequirementType.OTHER);
        requirement.setNotes(notes);
        requirement.setCreatedAt(OffsetDateTime.now());
        return requirement;
    }
}
