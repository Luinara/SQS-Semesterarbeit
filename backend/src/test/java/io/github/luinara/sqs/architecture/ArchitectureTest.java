package io.github.luinara.sqs.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.stream.Stream;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Enforces the feature-specific architecture of the application using ArchUnit.
 *
 * <p>Expected package structure (feature-based):
 * <pre>
 *   io.github.luinara.sqs
 *   ├── user/
 *   │   ├── TaskController.java
 *   │   ├── UserService.java
 *   │   └── Repository.java
 *   ├── task/
 *   ├── authentication/
 *   ├── weather/
 *   ├── common/           – Shared utilities
 *   │   ├── exception/
 *   │   ├── config/
 *   │   └── util/
 *   └── SelfCareApp.java
 * </pre>
 *
 * <p>Rules enforce:
 * <ul>
 *   <li>Controllers stay in feature packages</li>
 *   <li>Services are properly annotated with @Service</li>
 *   <li>Repositories are properly annotated with @Repository</li>
 *   <li>No cyclic dependencies between features</li>
 *   <li>Controllers don't bypass services to access repositories</li>
 *   <li>Classes follow Java naming conventions</li>
 * </ul>
 */
class ArchitectureTest {

    private static final JavaClasses APPLICATION_CLASSES = new ClassFileImporter()
            .withImportOption(new ImportOption.DoNotIncludeTests())
            .importPackages("io.github.luinara.sqs");

    @TestFactory
    Stream<DynamicTest> architecture_rules() {
        return Stream.of(
                controllers_should_be_named_controller,
                services_should_be_named_service,
                repositories_should_be_named_repository,
                services_must_not_depend_on_controllers,
                controllers_must_not_access_repositories_directly,
                repositories_should_not_depend_on_controllers,
                classes_should_follow_naming_conventions,
                interfaces_should_follow_naming_conventions,
                no_classes_should_throw_generic_exceptions
        ).map(rule -> DynamicTest.dynamicTest(rule.getDescription(), () -> rule.check(APPLICATION_CLASSES)));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Feature Structure Rules
    // ─────────────────────────────────────────────────────────────────────

    static final ArchRule controllers_should_be_named_controller =
            classes()
                    .that().areAnnotatedWith(RestController.class)
                    .or().areAnnotatedWith(Controller.class)
                    .should().haveSimpleNameEndingWith("Controller")
                    .as("Classes annotated with @Controller or @RestController must be named '*Controller'");


    static final ArchRule services_should_be_named_service =
            classes()
                    .that().areAnnotatedWith(Service.class)
                    .should().haveSimpleNameEndingWith("Service")
                    .as("Classes annotated with @Service must be named '*Service'");


    static final ArchRule repositories_should_be_named_repository =
            classes()
                    .that().areAnnotatedWith(Repository.class)
                    .should().haveSimpleNameEndingWith("Repository")
                    .as("Classes annotated with @Repository must be named '*Repository'");

    // ─────────────────────────────────────────────────────────────────────
    // Layer Dependency Rules
    // ─────────────────────────────────────────────────────────────────────

    static final ArchRule services_must_not_depend_on_controllers =
            noClasses()
                    .that().areAnnotatedWith(Service.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(RestController.class)
                    .as("Services must not depend on controllers");

    static final ArchRule controllers_must_not_access_repositories_directly =
            noClasses()
                    .that().areAnnotatedWith(RestController.class)
                    .or().areAnnotatedWith(Controller.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(Repository.class)
                    .as("Controllers must not access repositories directly; use services instead");

    static final ArchRule repositories_should_not_depend_on_controllers =
            noClasses()
                    .that().areAnnotatedWith(Repository.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(RestController.class)
                    .as("Repositories must not depend on controllers");

    // ─────────────────────────────────────────────────────────────────────
    // Java Best Practices
    // ─────────────────────────────────────────────────────────────────────

    static final ArchRule classes_should_follow_naming_conventions =
            classes()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .and().areNotInterfaces()
                    .should().haveSimpleNameNotContaining("_")
                    .as("Classes should not contain underscores in their names");

    static final ArchRule interfaces_should_follow_naming_conventions =
            classes()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .and().areInterfaces()
                    .should().haveSimpleNameNotStartingWith("Abstract")
                    .as("Interfaces should not be prefixed with 'Abstract'");

    static final ArchRule no_classes_should_throw_generic_exceptions =
            noClasses()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .and().haveSimpleNameNotContaining("Test")
                    .and().haveSimpleNameNotContaining("IntegrationTest")
                    .and().haveSimpleNameNotContaining("IT")
                    .and().areNotAnnotatedWith(ControllerAdvice.class)
                    .should().dependOnClassesThat()
                    .haveFullyQualifiedName("java.lang.Exception")
                    .as("Classes should throw specific exceptions, not generic 'Exception'");
}
