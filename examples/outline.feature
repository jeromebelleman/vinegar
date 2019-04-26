Feature: Outline Example
  Scenario Outline: I load the example homepages.
    Given I start 2 browsers
    When I set the URL to "<URL>"
    And I set the link to click to "More information..."
    Then the header should read "IANA-managed Reserved Domains".

    Examples:
      | URL                |
      | http://example.org |
      | http://example.net |
      | http://example.com |
      | http://example.edu |
