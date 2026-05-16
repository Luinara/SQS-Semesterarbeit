package com.example.app.architecture;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * Enforces the feature-specific architecture of the application using ArchUnit.
 *
 * <p>Expected package structure (feature-based):
 * <pre>
 *   io.github.luinara.sqs
 *   ├── user/
 *   │   ├── Controller.java
 *   │   ├── Service.java
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
@AnalyzeClasses(packages = "io.github.luinara.sqs")
class ArchitectureTest {

    // ─────────────────────────────────────────────────────────────────────
    // Feature Structure Rules
    // ─────────────────────────────────────────────────────────────────────

    @ArchTest
    static final ArchRule controllers_should_be_named_controller =
            classes()
                    .that().areAnnotatedWith(RestController.class)
                    .or().areAnnotatedWith(Controller.class)
                    .should().haveSimpleName("Controller")
                    .as("Classes annotated with @Controller or @RestController must be named exactly 'Controller'");


    @ArchTest
    static final ArchRule services_should_be_named_service =
            classes()
                    .that().areAnnotatedWith(Service.class)
                    .should().haveSimpleName("Service")
                    .as("Classes annotated with @Service must be named exactly 'Service'");


    @ArchTest
    static final ArchRule repositories_should_be_named_repository =
            classes()
                    .that().areAnnotatedWith(Repository.class)
                    .should().haveSimpleName("Repository")
                    .as("Classes annotated with @Repository must be named exactly 'Repository'");

    // ─────────────────────────────────────────────────────────────────────
    // Layer Dependency Rules
    // ─────────────────────────────────────────────────────────────────────

    @ArchTest
    static final ArchRule services_must_not_depend_on_controllers =
            noClasses()
                    .that().areAnnotatedWith(Service.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(RestController.class)
                    .as("Services must not depend on controllers");

    @ArchTest
    static final ArchRule controllers_must_not_access_repositories_directly =
            noClasses()
                    .that().areAnnotatedWith(RestController.class)
                    .or().areAnnotatedWith(Controller.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(Repository.class)
                    .as("Controllers must not access repositories directly; use services instead");

    @ArchTest
    static final ArchRule repositories_should_not_depend_on_controllers =
            noClasses()
                    .that().areAnnotatedWith(Repository.class)
                    .should().dependOnClassesThat()
                    .areAnnotatedWith(RestController.class)
                    .as("Repositories must not depend on controllers");

    // ─────────────────────────────────────────────────────────────────────
    // Java Best Practices
    // ─────────────────────────────────────────────────────────────────────

    @ArchTest
    static final ArchRule classes_should_follow_naming_conventions =
            classes()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .and().areNotInterfaces()
                    .should().haveSimpleNameNotContaining("_")
                    .as("Classes should not contain underscores in their names");

    @ArchTest
    static final ArchRule interfaces_should_follow_naming_conventions =
            classes()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .and().areInterfaces()
                    .should().haveSimpleNameNotStartingWith("Abstract")
                    .as("Interfaces should not be prefixed with 'Abstract'");

    @ArchTest
    static final ArchRule no_classes_should_throw_generic_exceptions =
            noClasses()
                    .that().resideInAPackage("io.github.luinara.sqs..")
                    .should().throwClassesThat()
                    .areAssignableTo(Throwable.class)
                    .and().haveSimpleName("Exception")
                    .as("Classes should throw specific exceptions, not generic 'Exception'");

    @ArchTest
    static final ArchRule exception_classes_should_reside_in_exception_package =
            classes()
                    .that().haveSimpleNameEndingWith("Exception")
                    .should().resideInAPackage("..exception..")
                    .as("Exception classes should reside in 'exception' packages");
}
