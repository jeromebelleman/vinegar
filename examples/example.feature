Feature: Example
  Scenario: I load the example.com homepage.
    Given I start 2 browsers
    When I set the URL to "http://example.org"
    And I set the link to click to "More information..."
    Then the header should read "IANA-managed Reserved Domains".
