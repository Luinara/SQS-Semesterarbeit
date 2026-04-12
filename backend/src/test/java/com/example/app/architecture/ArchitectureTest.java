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
 * Enforces the layered architecture of the application using ArchUnit.
 *
 * <p>Expected package structure:
 * <pre>
 *   com.example.app
 *   ├── controller   – HTTP entry points (@RestController / @Controller)
 *   ├── service      – Business logic (@Service)
 *   ├── repository   – Data access (@Repository)
 *   ├── domain       – Core models (entities, value objects)
 *   ├── config       – Spring configuration
 *   └── integration  – External service communication
 * </pre>
 *
 * <p>Rules pass vacuously while packages are still empty (controlled by
 * {@code archunit.properties}). They will automatically enforce the
 * architecture as the codebase grows.
 */
@AnalyzeClasses(packages = "com.example.app")
class ArchitectureTest {

    @ArchTest
    static final ArchRule controllers_should_reside_in_controller_package =
            classes()
                    .that().areAnnotatedWith(RestController.class)
                    .or().areAnnotatedWith(Controller.class)
                    .should().resideInAPackage("..controller..")
                    .as("Controllers should reside in a package named 'controller'");

    @ArchTest
    static final ArchRule services_should_reside_in_service_package =
            classes()
                    .that().areAnnotatedWith(Service.class)
                    .should().resideInAPackage("..service..")
                    .as("Services should reside in a package named 'service'");

    @ArchTest
    static final ArchRule repositories_should_reside_in_repository_package =
            classes()
                    .that().areAnnotatedWith(Repository.class)
                    .should().resideInAPackage("..repository..")
                    .as("Repositories should reside in a package named 'repository'");

    @ArchTest
    static final ArchRule service_layer_must_not_depend_on_controllers =
            noClasses()
                    .that().resideInAPackage("..service..")
                    .should().dependOnClassesThat().resideInAPackage("..controller..")
                    .as("Services must not depend on controllers");

    @ArchTest
    static final ArchRule controllers_must_not_access_repositories_directly =
            noClasses()
                    .that().resideInAPackage("..controller..")
                    .should().dependOnClassesThat().resideInAPackage("..repository..")
                    .as("Controllers must not access repositories directly; use services instead");
}
